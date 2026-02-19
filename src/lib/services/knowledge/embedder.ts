import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { generateEmbeddings } from "@/lib/services/openai/service";
import { chunkText } from "./chunker";
import { extractPdfText, extractDocxText, extractUrlText } from "./extractors";

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  return _supabase;
}

export async function processKnowledge(knowledgeId: string) {
  const knowledge = await prisma.coachKnowledge.findUnique({
    where: { id: knowledgeId },
  });

  if (!knowledge) return;

  try {
    await prisma.coachKnowledge.update({
      where: { id: knowledgeId },
      data: { status: "PROCESSING" },
    });

    // Extract text based on type
    let text: string;

    switch (knowledge.type) {
      case "TEXT":
        text = knowledge.content;
        break;

      case "FAQ":
        text = knowledge.content; // Already formatted as Q&A
        break;

      case "URL":
        text = await extractUrlText(knowledge.content);
        break;

      case "DOCUMENT": {
        if (!knowledge.storageKey) {
          throw new Error("No storage key for document");
        }

        const { data, error } = await getSupabase().storage
          .from("knowledge")
          .download(knowledge.storageKey);

        if (error || !data) {
          throw new Error(`Failed to download file: ${error?.message}`);
        }

        const buffer = Buffer.from(await data.arrayBuffer());
        const ext = knowledge.storageKey.split(".").pop()?.toLowerCase();

        if (ext === "pdf") {
          text = await extractPdfText(buffer);
        } else if (ext === "docx") {
          text = await extractDocxText(buffer);
        } else {
          text = buffer.toString("utf-8");
        }
        break;
      }

      default:
        throw new Error(`Unknown knowledge type: ${knowledge.type}`);
    }

    // Chunk the text
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error("No content to process");
    }

    // Generate embeddings in batches
    const batchSize = 50;
    const allChunkData: { content: string; embedding: number[] }[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddings(batch);

      for (let j = 0; j < batch.length; j++) {
        allChunkData.push({
          content: batch[j],
          embedding: embeddings[j],
        });
      }
    }

    // Delete existing chunks for this knowledge item
    await prisma.coachKnowledgeChunk.deleteMany({
      where: { knowledgeId },
    });

    // Insert chunks with embeddings using raw SQL (Prisma doesn't support vector type directly)
    for (let i = 0; i < allChunkData.length; i++) {
      const { content, embedding } = allChunkData[i];
      const id = `ckc_${Date.now()}_${i}`;
      const embeddingStr = `[${embedding.join(",")}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO coach_knowledge_chunks (id, "knowledgeId", "coachId", content, embedding, "chunkIndex", "createdAt")
         VALUES ($1, $2, $3, $4, $5::vector, $6, NOW())`,
        id,
        knowledgeId,
        knowledge.coachId,
        content,
        embeddingStr,
        i
      );
    }

    // Update knowledge status
    await prisma.coachKnowledge.update({
      where: { id: knowledgeId },
      data: {
        status: "COMPLETED",
        chunkCount: allChunkData.length,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Knowledge processing error:", error);

    await prisma.coachKnowledge.update({
      where: { id: knowledgeId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
