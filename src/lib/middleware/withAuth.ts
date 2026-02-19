import { NextRequest, NextResponse } from "next/server";
import { getServerSession, AuthUser } from "@/lib/auth/server-session";

type AuthRouteHandler = (
  request: NextRequest,
  user: AuthUser,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withAuth(handler: AuthRouteHandler) {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, session.user, context);
  };
}
