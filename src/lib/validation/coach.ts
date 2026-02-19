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
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required").max(5000),
  emoji: z.string().default("🎯"),
  tone: z.enum(TONES).default("Professional"),
});

export const updateCoachSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(5000).optional(),
  emoji: z.string().optional(),
  tone: z.enum(TONES).optional(),
  systemPrompt: z.string().max(10000).nullable().optional(),
  welcomeMessage: z.string().max(500).optional(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;
