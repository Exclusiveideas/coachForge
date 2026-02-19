import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { CreateCoachInput, UpdateCoachInput } from "@/lib/validation/coach";

export function generateSystemPrompt(coach: {
  name: string;
  description: string;
  tone: string;
}): string {
  return `You are ${coach.name}, an AI coach. ${coach.description}

Your coaching style is: ${coach.tone}

Guidelines:
- Be helpful, supportive, and focused on the user's growth
- Draw from your knowledge base when available
- If you don't know something, be honest about it
- Keep responses concise but thorough
- Ask clarifying questions when needed`;
}

export async function createCoach(userId: string, input: CreateCoachInput) {
  const embedCode = `coach_${nanoid(12)}`;
  const systemPrompt = generateSystemPrompt(input);

  return prisma.coach.create({
    data: {
      ...input,
      userId,
      embedCode,
      systemPrompt,
    },
  });
}

export async function getCoachesByUser(userId: string) {
  return prisma.coach.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { knowledgeBase: true, feedbacks: true },
      },
    },
  });
}

export async function getCoachById(id: string, userId: string) {
  return prisma.coach.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { knowledgeBase: true, feedbacks: true },
      },
    },
  });
}

export async function updateCoach(
  id: string,
  userId: string,
  input: UpdateCoachInput
) {
  const coach = await prisma.coach.findFirst({ where: { id, userId } });
  if (!coach) return null;

  return prisma.coach.update({
    where: { id },
    data: input,
  });
}

export async function deleteCoach(id: string, userId: string) {
  const coach = await prisma.coach.findFirst({ where: { id, userId } });
  if (!coach) return null;

  await prisma.coach.delete({ where: { id } });
  return coach;
}
