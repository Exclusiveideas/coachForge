import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { updateCoachSchema } from "@/lib/validation/coach";
import {
  getCoachById,
  updateCoach,
  deleteCoach,
} from "@/lib/services/coachService";

export const GET = withAuth(async (_request, user, context) => {
  const { id } = await context!.params;
  const coach = await getCoachById(id, user.id);

  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  return NextResponse.json({ coach });
});

export const PATCH = withAuth(async (request: NextRequest, user, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const parsed = updateCoachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const coach = await updateCoach(id, user.id, parsed.data);
    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    return NextResponse.json({ coach });
  } catch {
    return NextResponse.json(
      { error: "Failed to update coach" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (_request, user, context) => {
  const { id } = await context!.params;
  const coach = await deleteCoach(id, user.id);

  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Coach deleted" });
});
