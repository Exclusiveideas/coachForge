import { cache } from "react";
import { prisma } from "@/lib/db";
import { getSession } from "./session";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ServerSession {
  user: AuthUser;
}

export const getServerSession = cache(
  async (): Promise<ServerSession | null> => {
    const session = await getSession();

    if (!session.userId) {
      return null;
    }

    const dbSession = await prisma.session.findFirst({
      where: {
        id: session.sessionId,
        userId: session.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!dbSession) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return null;
    }

    return { user };
  }
);
