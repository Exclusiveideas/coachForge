import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { createCoachSchema } from "@/lib/validation/coach";
import { createCoach, getCoachesByUser } from "@/lib/services/coachService";

export const GET = withAuth(async (_request, user) => {
  const coaches = await getCoachesByUser(user.id);
  return NextResponse.json({ coaches });
});

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const parsed = createCoachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const coach = await createCoach(user.id, parsed.data);
    return NextResponse.json({ coach }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create coach" },
      { status: 500 }
    );
  }
});
