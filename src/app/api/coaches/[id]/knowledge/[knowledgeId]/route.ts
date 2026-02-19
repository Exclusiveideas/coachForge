import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/services/storage/supabase";

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

  // Delete file from storage if it exists
  if (knowledge.storageKey) {
    await deleteFile("knowledge", knowledge.storageKey).catch(console.error);
  }

  // Delete chunks and knowledge item (cascades via Prisma)
  await prisma.coachKnowledge.delete({ where: { id: knowledgeId } });

  return NextResponse.json({ message: "Knowledge item deleted" });
});
