import OpenAI from "openai";

let _client: OpenAI | null = null;
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return _client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: "openai/text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await getClient().embeddings.create({
    model: "openai/text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

export interface StreamChatParams {
  modelId: string;
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function streamChatCompletion(
  params: StreamChatParams,
  onChunk: (content: string) => void,
): Promise<void> {
  const stream = await getClient().chat.completions.create({
    model: params.modelId,
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      onChunk(content);
    }
  }
}

// --- Model catalog (cached) ---

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

let cachedModels: OpenRouterModel[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function fetchModels(): Promise<OpenRouterModel[]> {
  if (cachedModels && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedModels;
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status}`);
  }

  const data = await res.json();
  const models = (data.data as OpenRouterModel[])
    .filter((m) => {
      const id = m.id.toLowerCase();
      return (
        !id.includes("embed") &&
        !id.includes("moderation") &&
        !id.includes("tts") &&
        !id.includes("whisper") &&
        !id.includes("dall-e") &&
        !id.includes("image")
      );
    })
    .map((m) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length,
      pricing: {
        prompt: m.pricing.prompt,
        completion: m.pricing.completion,
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  cachedModels = models;
  cacheTimestamp = Date.now();
  return models;
}

export async function getModelContextLength(
  modelId: string,
): Promise<number | null> {
  try {
    const models = await fetchModels();
    const model = models.find((m) => m.id === modelId);
    return model?.context_length ?? null;
  } catch {
    return null;
  }
}

// --- Token-aware message truncation ---

const CHARS_PER_TOKEN = 4;
const MAX_HISTORY_MESSAGES = 50;
const MIN_HISTORY_BUDGET = 2000;
const RESERVED_TOKENS = 6000;
const DEFAULT_CONTEXT_LENGTH = 16384;

type ChatMessage = { role: "user" | "assistant"; content: string };

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function truncateToTokenBudget(
  messages: ChatMessage[],
  contextLength: number | null,
): ChatMessage[] {
  const effectiveContext = contextLength ?? DEFAULT_CONTEXT_LENGTH;
  const budget = Math.max(
    effectiveContext - RESERVED_TOKENS,
    MIN_HISTORY_BUDGET,
  );
  const capped = messages.slice(-MAX_HISTORY_MESSAGES);

  let totalTokens = 0;
  let startIndex = capped.length;

  for (let i = capped.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(capped[i].content);
    if (totalTokens + msgTokens > budget) break;
    totalTokens += msgTokens;
    startIndex = i;
  }

  return capped.slice(startIndex);
}
