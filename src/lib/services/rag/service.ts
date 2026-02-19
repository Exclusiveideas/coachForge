import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/services/openai/service";

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

interface RetrievedChunk {
  content: string;
  similarity: number;
}

export async function queryKnowledgeBase(
  coachId: string,
  query: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await getSupabase().rpc("match_knowledge_chunks", {
    query_embedding: queryEmbedding,
    match_coach_id: coachId,
    match_count: topK,
    match_threshold: 0.5,
  });

  if (error) {
    console.error("RAG query error:", error);
    return [];
  }

  return (data || []).map((row: { content: string; similarity: number }) => ({
    content: row.content,
    similarity: row.similarity,
  }));
}

export function buildContextString(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const context = chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");

  return `\nRelevant context from knowledge base:\n${context}\n\nUse the above context to inform your response when relevant. If the context doesn't relate to the user's question, rely on your general knowledge.`;
}
