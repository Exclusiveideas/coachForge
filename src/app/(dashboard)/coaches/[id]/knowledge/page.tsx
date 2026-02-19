import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-session";
import { prisma } from "@/lib/db";
import { KnowledgePageClient } from "@/components/coaches/KnowledgePageClient";

export default async function KnowledgePage({
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

  const knowledge = await prisma.coachKnowledge.findMany({
    where: { coachId: id },
    orderBy: { createdAt: "desc" },
  });

  return <KnowledgePageClient coachId={id} initialKnowledge={knowledge} />;
}
