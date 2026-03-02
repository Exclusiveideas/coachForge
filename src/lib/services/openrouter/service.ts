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
