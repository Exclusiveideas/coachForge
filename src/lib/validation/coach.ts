import { z } from "zod";

export const TONES = [
  "Professional",
  "Warm & Encouraging",
  "Direct & Blunt",
  "Socratic",
  "Motivational",
  "Casual & Friendly",
] as const;

export const EMOJI_OPTIONS = [
  "🎯", "🏰", "🚀", "🧠", "💪", "✨", "📈", "⚡",
] as const;

export const createCoachSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  emoji: z.string().default("🎯"),
  tone: z.enum(TONES).default("Professional"),
});

export const updateCoachSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  emoji: z.string().optional(),
  tone: z.enum(TONES).optional(),
  systemPrompt: z.string().nullable().optional(),
  welcomeMessage: z.string().optional(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;
