import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { fetchModels } from "@/lib/services/openrouter/service";

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
