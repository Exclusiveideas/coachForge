import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-session";
import { prisma } from "@/lib/db";
import { FeedbackList } from "@/components/coaches/FeedbackList";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession();

  const coach = await prisma.coach.findFirst({
    where: { id, userId: session!.user.id },
  });
  if (!coach) notFound();

  const feedbacks = await prisma.coachFeedback.findMany({
    where: { coachId: id },
    orderBy: { submittedAt: "desc" },
  });

  return <FeedbackList feedbacks={feedbacks} />;
}
