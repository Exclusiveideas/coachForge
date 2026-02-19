import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/db";

export const GET = withAuth(async (_request, user, context) => {
  const { id } = await context!.params;

  const coach = await prisma.coach.findFirst({
    where: { id, userId: user.id },
  });
  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  const feedbacks = await prisma.coachFeedback.findMany({
    where: { coachId: id },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ feedbacks });
});
