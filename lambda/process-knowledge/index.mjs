import pg from "pg";
import OpenAI from "openai";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Chunker (mirrored from src/lib/services/knowledge/chunker.ts) ---

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

function chunkText(text) {
  const cleanText = text.replace(/\n{3,}/g, "\n\n").trim();

  if (cleanText.length <= CHUNK_SIZE) {
    return [cleanText];
  }

  const chunks = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + CHUNK_SIZE;

    if (end < cleanText.length) {
      const searchArea = cleanText.slice(start + CHUNK_SIZE - 100, end + 50);
      const breakPoints = ["\n\n", ".\n", ". ", "? ", "! ", "\n"];

      for (const bp of breakPoints) {
        const idx = searchArea.lastIndexOf(bp);
        if (idx !== -1) {
          end = start + CHUNK_SIZE - 100 + idx + bp.length;
          break;
        }
      }
    } else {
      end = cleanText.length;
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= cleanText.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

// --- URL Text Extraction (mirrored from src/lib/services/knowledge/extractors.ts) ---

async function extractUrlText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CoachForge/1.0 (Knowledge Base Crawler)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text.length < 10) {
    throw new Error("No meaningful text content found at URL");
  }

  return text;
}

// --- Embedding Generation ---

async function generateEmbeddings(texts) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

// --- Main Handler ---

export async function handler(event) {
  const { knowledgeId } = event;

  if (!knowledgeId) {
    console.error("No knowledgeId provided");
    return { statusCode: 400, body: "Missing knowledgeId" };
  }

  const client = await pool.connect();

  try {
    // Fetch knowledge record
    const { rows } = await client.query(
      'SELECT id, "coachId", type, content, "retryCount" FROM coach_knowledge WHERE id = $1',
      [knowledgeId]
    );

    if (rows.length === 0) {
      console.error(`Knowledge ${knowledgeId} not found`);
      return { statusCode: 404, body: "Knowledge not found" };
    }

    const knowledge = rows[0];

    // Set status to PROCESSING
    await client.query(
      "UPDATE coach_knowledge SET status = $1 WHERE id = $2",
      ["PROCESSING", knowledgeId]
    );

    // Extract text based on type
    let text;
    switch (knowledge.type) {
      case "TEXT":
      case "FAQ":
      case "DOCUMENT":
        text = knowledge.content;
        break;
      case "URL":
        text = await extractUrlText(knowledge.content);
        break;
      default:
        throw new Error(`Unknown knowledge type: ${knowledge.type}`);
    }

    // Chunk the text
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error("No content to process");
    }

    console.log(
      `Processing ${knowledgeId}: ${chunks.length} chunks from ${text.length} chars`
    );

    // Generate embeddings in batches
    const batchSize = 50;
    const allChunkData = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddings(batch);

      for (let j = 0; j < batch.length; j++) {
        allChunkData.push({
          content: batch[j],
          embedding: embeddings[j],
        });
      }

      console.log(
        `Embedded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`
      );
    }

    // Delete existing chunks
    await client.query(
      'DELETE FROM coach_knowledge_chunks WHERE "knowledgeId" = $1',
      [knowledgeId]
    );

    // Insert chunks with embeddings
    for (let i = 0; i < allChunkData.length; i++) {
      const { content, embedding } = allChunkData[i];
      const id = `ckc_${Date.now()}_${i}`;
      const embeddingStr = `[${embedding.join(",")}]`;

      await client.query(
        `INSERT INTO coach_knowledge_chunks (id, "knowledgeId", "coachId", content, embedding, "chunkIndex", "createdAt")
         VALUES ($1, $2, $3, $4, $5::vector, $6, NOW())`,
        [id, knowledgeId, knowledge.coachId, content, embeddingStr, i]
      );
    }

    // Update status to COMPLETED
    await client.query(
      `UPDATE coach_knowledge SET status = $1, "chunkCount" = $2, "processedAt" = NOW(), error = NULL WHERE id = $3`,
      ["COMPLETED", allChunkData.length, knowledgeId]
    );

    console.log(
      `Completed ${knowledgeId}: ${allChunkData.length} chunks stored`
    );

    return { statusCode: 200, body: `Processed ${allChunkData.length} chunks` };
  } catch (error) {
    console.error("Processing error:", error);

    try {
      await client.query(
        `UPDATE coach_knowledge SET status = $1, "retryCount" = "retryCount" + 1, error = $2 WHERE id = $3`,
        [
          "FAILED",
          error instanceof Error ? error.message : "Unknown error",
          knowledgeId,
        ]
      );
    } catch (updateError) {
      console.error("Failed to update error status:", updateError);
    }

    return { statusCode: 500, body: error.message };
  } finally {
    client.release();
  }
}
