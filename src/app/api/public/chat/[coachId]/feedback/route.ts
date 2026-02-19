import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

const feedbackSchema = z.object({
  sessionId: z.string().min(1),
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const { coachId } = await params;

  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
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

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    await prisma.coachFeedback.create({
      data: {
        coachId: coach.id,
        sessionId: parsed.data.sessionId,
        subject: parsed.data.subject,
        content: parsed.data.content,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(
      { message: "Feedback submitted" },
      { headers: corsHeaders() }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
