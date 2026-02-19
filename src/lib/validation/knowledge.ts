import { z } from "zod";

export const addKnowledgeSchema = z.object({
  type: z.enum(["FAQ", "TEXT", "URL"]),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(50000),
});

export type AddKnowledgeInput = z.infer<typeof addKnowledgeSchema>;
