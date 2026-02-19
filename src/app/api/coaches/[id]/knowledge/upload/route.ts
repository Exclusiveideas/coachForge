import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/db";
import { invokeProcessKnowledge } from "@/lib/services/lambda";
import {
  extractPdfText,
  extractDocText,
  extractDocxText,
} from "@/lib/services/knowledge/extractors";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

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
        { error: "File type not supported. Use PDF, DOC, DOCX, or TXT." },
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
    const ext = file.name.split(".").pop()?.toLowerCase();

    let content: string;
    if (ext === "pdf") {
      content = await extractPdfText(buffer);
    } else if (ext === "doc") {
      content = await extractDocText(buffer);
    } else if (ext === "docx") {
      content = await extractDocxText(buffer);
    } else {
      content = buffer.toString("utf-8");
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "No meaningful text content found in document" },
        { status: 400 }
      );
    }

    const knowledge = await prisma.coachKnowledge.create({
      data: {
        coachId: id,
        type: "DOCUMENT",
        title: title || file.name,
        content: content.trim(),
      },
    });

    await invokeProcessKnowledge(knowledge.id);

    return NextResponse.json({ knowledge }, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
});
