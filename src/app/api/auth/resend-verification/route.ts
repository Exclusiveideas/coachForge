import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateVerifyToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      const token = generateVerifyToken(user.id, user.email);
      await sendVerificationEmail(user.email, user.name, token);
    }

    return NextResponse.json({
      message: "If an account exists with that email, a verification link has been sent.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
