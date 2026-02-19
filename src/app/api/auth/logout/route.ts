import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, destroySession } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await getSession();

    if (session.sessionId) {
      await prisma.session.delete({
        where: { id: session.sessionId },
      }).catch(() => {});
    }

    await destroySession();

    return NextResponse.json({ message: "Logged out" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
