import { z } from "zod";

export const addKnowledgeSchema = z.object({
  type: z.enum(["FAQ", "TEXT", "URL"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type AddKnowledgeInput = z.infer<typeof addKnowledgeSchema>;
