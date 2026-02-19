import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { streamChatCompletion } from "@/lib/services/openai/service";
import {
  queryKnowledgeBase,
  buildContextString,
} from "@/lib/services/rag/service";
import { generateSystemPrompt } from "@/lib/services/coachService";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const { coachId } = await params;

  const coach = await prisma.coach.findFirst({
    where: { OR: [{ id: coachId }, { embedCode: coachId }] },
    select: {
      id: true,
      name: true,
      emoji: true,
      tone: true,
      welcomeMessage: true,
    },
  });

  if (!coach) {
    return NextResponse.json(
      { error: "Coach not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ coach }, { headers: corsHeaders() });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const { coachId } = await params;

  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string" || message.length > 10000) {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const coach = await prisma.coach.findFirst({
      where: { OR: [{ id: coachId }, { embedCode: coachId }] },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // RAG retrieval (include recent user messages for context-aware search)
    const recentUserMessages = conversationHistory
      .filter((msg: { role: string }) => msg.role === "user")
      .slice(-2)
      .map((msg: { content: string }) => msg.content);
    const ragQuery = [...recentUserMessages, message].join("\n");
    const chunks = await queryKnowledgeBase(coach.id, ragQuery);
    const contextString = buildContextString(chunks);

    // Build system prompt
    const basePrompt =
      coach.systemPrompt ||
      generateSystemPrompt({
        name: coach.name,
        description: coach.description,
        tone: coach.tone,
      });
    const fullSystemPrompt = basePrompt + contextString;

    // Build message history (limit to last 10 messages)
    const messages = [
      ...conversationHistory.slice(-10).map(
        (msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })
      ),
      { role: "user" as const, content: message },
    ];

    // Create SSE stream
    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: string) {
          if (!closed) {
            try {
              controller.enqueue(encoder.encode(data));
            } catch {
              closed = true;
            }
          }
        }

        try {
          send(`data: ${JSON.stringify({ type: "start" })}\n\n`);

          await streamChatCompletion(
            { systemPrompt: fullSystemPrompt, messages },
            (content) => {
              send(`data: ${JSON.stringify({ type: "content", content })}\n\n`);
            }
          );

          send(`data: ${JSON.stringify({ type: "complete" })}\n\n`);
        } catch (error) {
          console.error("Stream error:", error);
          send(`data: ${JSON.stringify({ type: "error", error: "Failed to generate response" })}\n\n`);
        } finally {
          if (!closed) controller.close();
          closed = true;
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
