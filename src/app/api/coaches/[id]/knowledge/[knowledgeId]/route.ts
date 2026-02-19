import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/db";

export const DELETE = withAuth(async (_request, user, context) => {
  const { id, knowledgeId } = await context!.params;

  const coach = await prisma.coach.findFirst({
    where: { id, userId: user.id },
  });
  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  const knowledge = await prisma.coachKnowledge.findFirst({
    where: { id: knowledgeId, coachId: id },
  });
  if (!knowledge) {
    return NextResponse.json(
      { error: "Knowledge item not found" },
      { status: 404 }
    );
  }

  await prisma.coachKnowledge.delete({ where: { id: knowledgeId } });

  return NextResponse.json({ message: "Knowledge item deleted" });
});
