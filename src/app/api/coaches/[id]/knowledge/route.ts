import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/db";
import { addKnowledgeSchema } from "@/lib/validation/knowledge";
import { invokeProcessKnowledge } from "@/lib/services/lambda";

export const GET = withAuth(async (_request, user, context) => {
  const { id } = await context!.params;

  // Verify ownership
  const coach = await prisma.coach.findFirst({
    where: { id, userId: user.id },
  });
  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  const knowledge = await prisma.coachKnowledge.findMany({
    where: { coachId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ knowledge });
});

export const POST = withAuth(async (request: NextRequest, user, context) => {
  const { id } = await context!.params;

  const coach = await prisma.coach.findFirst({
    where: { id, userId: user.id },
  });
  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = addKnowledgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const knowledge = await prisma.coachKnowledge.create({
      data: {
        coachId: id,
        type: parsed.data.type,
        title: parsed.data.title,
        content: parsed.data.content,
      },
    });

    await invokeProcessKnowledge(knowledge.id);

    return NextResponse.json({ knowledge }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to add knowledge" },
      { status: 500 }
    );
  }
});
