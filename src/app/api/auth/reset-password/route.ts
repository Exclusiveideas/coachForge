import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { generateResetToken, verifyResetToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/resend";

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If token is present, this is a password reset execution
    if (body.token) {
      const parsed = resetSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const { token, password } = parsed.data;

      let payload;
      try {
        payload = verifyResetToken(token);
      } catch {
        return NextResponse.json(
          { error: "Invalid or expired reset link" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.email !== payload.email) {
        return NextResponse.json(
          { error: "Invalid reset link" },
          { status: 400 }
        );
      }

      // Check if token has already been used (password changed after token was issued)
      if (user.passwordChangedAt && payload.iat) {
        const tokenIssuedAt = new Date(payload.iat * 1000);
        if (user.passwordChangedAt > tokenIssuedAt) {
          return NextResponse.json(
            { error: "This reset link has already been used" },
            { status: 400 }
          );
        }
      }

      const hashedPassword = await hashPassword(password);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      });

      // Invalidate all sessions for security
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      return NextResponse.json({ message: "Password reset successfully" });
    }

    // Otherwise, this is a reset request (send email)
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (user) {
      const token = generateResetToken(user.id, user.email);
      await sendPasswordResetEmail(user.email, token).catch(console.error);
    }

    return NextResponse.json({
      message: "If an account exists with that email, you'll receive a reset link shortly.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
