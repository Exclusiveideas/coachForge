import jwt from "jsonwebtoken";

interface ResetTokenPayload {
  userId: string;
  email: string;
  type: "reset";
  iat?: number;
}

interface VerifyTokenPayload {
  userId: string;
  email: string;
  type: "verify";
  iat?: number;
}

function getJwtSecret(): string {
  const secret = process.env.SESSION_PASSWORD;
  if (!secret) throw new Error("SESSION_PASSWORD not set");
  return secret;
}

export function generateResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: "reset" } satisfies ResetTokenPayload,
    getJwtSecret(),
    { expiresIn: "1h" }
  );
}

export function verifyResetToken(token: string): ResetTokenPayload {
  const payload = jwt.verify(token, getJwtSecret()) as ResetTokenPayload;
  if (payload.type !== "reset") {
    throw new Error("Invalid token type");
  }
  return payload;
}

export function generateVerifyToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: "verify" } satisfies VerifyTokenPayload,
    getJwtSecret(),
    { expiresIn: "24h" }
  );
}

export function verifyEmailToken(token: string): VerifyTokenPayload {
  const payload = jwt.verify(token, getJwtSecret()) as VerifyTokenPayload;
  if (payload.type !== "verify") {
    throw new Error("Invalid token type");
  }
  return payload;
}
