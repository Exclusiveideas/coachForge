import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/services/storage/supabase";
import { processKnowledge } from "@/lib/services/knowledge/embedder";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = withAuth(async (request: NextRequest, user, context) => {
  const { id } = await context!.params;

  const coach = await prisma.coach.findFirst({
    where: { id, userId: user.id },
  });
  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const storageKey = `${id}/${nanoid()}.${ext}`;

    await uploadFile("knowledge", storageKey, buffer, file.type);

    const knowledge = await prisma.coachKnowledge.create({
      data: {
        coachId: id,
        type: "DOCUMENT",
        title: title || file.name,
        content: file.name,
        storageKey,
      },
    });

    // Process in background
    processKnowledge(knowledge.id).catch(console.error);

    return NextResponse.json({ knowledge }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
});
