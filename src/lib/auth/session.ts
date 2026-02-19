import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  sessionId: string;
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "coachforge-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function createSession(data: SessionData): Promise<void> {
  const session = await getSession();
  session.userId = data.userId;
  session.email = data.email;
  session.sessionId = data.sessionId;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
