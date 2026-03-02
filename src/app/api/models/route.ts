import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture?: {
    modality?: string;
  };
}

let cachedModels: OpenRouterModel[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchModels(): Promise<OpenRouterModel[]> {
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

export const GET = withAuth(async () => {
  try {
    const models = await fetchModels();
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 },
    );
  }
});
