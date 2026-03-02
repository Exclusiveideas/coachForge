import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { truncateToTokenBudget } from "./service";

type ChatMessage = { role: "user" | "assistant"; content: string };

function makeMessage(
  role: "user" | "assistant",
  charCount: number,
): ChatMessage {
  return { role, content: "x".repeat(charCount) };
}

function makeConversation(count: number, charsPerMsg = 100): ChatMessage[] {
  return Array.from({ length: count }, (_, i) =>
    makeMessage(i % 2 === 0 ? "user" : "assistant", charsPerMsg),
  );
}

describe("truncateToTokenBudget", () => {
  test("returns empty array for empty input", () => {
    expect(truncateToTokenBudget([], 16384)).toEqual([]);
  });

  test("returns all messages when they fit within budget", () => {
    const messages = makeConversation(5, 100);
    // 5 msgs * 100 chars = 500 chars = 125 tokens, well under any budget
    const result = truncateToTokenBudget(messages, 16384);
    expect(result).toEqual(messages);
  });

  test("truncates oldest messages when exceeding budget", () => {
    // Budget: contextLength 8000 - 6000 reserved = 2000 token budget
    // Each message: 400 chars = 100 tokens
    // Budget fits 20 messages, but we have 30
    const messages = makeConversation(30, 400);
    const result = truncateToTokenBudget(messages, 8000);
    expect(result.length).toBe(20);
    expect(result[0]).toEqual(messages[10]);
    expect(result[result.length - 1]).toEqual(messages[29]);
  });

  test("keeps most recent messages (preserves recency)", () => {
    // Budget: 7000 - 6000 = 1000, floored to 2000 tokens = 8000 chars
    // Each message: 3000 chars = 750 tokens
    // Only last 2 messages fit (1500 tokens < 2000), 3rd from end would be 2250 > 2000
    const messages: ChatMessage[] = [
      makeMessage("user", 3000),
      makeMessage("assistant", 3000),
      makeMessage("user", 3000),
      makeMessage("assistant", 3000),
    ];
    const result = truncateToTokenBudget(messages, 7000);
    expect(result).toEqual(messages.slice(2));
  });

  test("caps at 50 messages even with huge context window", () => {
    const messages = makeConversation(100, 100);
    const result = truncateToTokenBudget(messages, 1_000_000);
    expect(result.length).toBe(50);
    expect(result[0]).toEqual(messages[50]);
    expect(result[49]).toEqual(messages[99]);
  });

  test("uses minimum budget floor of 2000 tokens for tiny context windows", () => {
    // contextLength 4000 - 6000 reserved = -2000, floored to 2000 tokens
    // 2000 tokens = 8000 chars
    // Each message: 400 chars = 100 tokens, so 20 fit
    const messages = makeConversation(30, 400);
    const result = truncateToTokenBudget(messages, 4000);
    expect(result.length).toBe(20);
  });

  test("uses default context length (16384) when null", () => {
    // null -> default 16384 - 6000 = 10384 tokens = 41536 chars
    // Each message: 400 chars = 100 tokens, all 30 fit
    const messages = makeConversation(30, 400);
    const result = truncateToTokenBudget(messages, null);
    expect(result.length).toBe(30);
  });

  test("handles single message that exceeds entire budget", () => {
    // Budget: min floor = 2000 tokens = 8000 chars
    // Single message of 10000 chars = 2500 tokens, exceeds budget
    const messages = [makeMessage("user", 10000)];
    const result = truncateToTokenBudget(messages, 7000);
    expect(result).toEqual([]);
  });

  test("handles messages of varying lengths", () => {
    // Budget: 8000 - 6000 = 2000 tokens = 8000 chars
    const messages: ChatMessage[] = [
      makeMessage("user", 4000), // 1000 tokens
      makeMessage("assistant", 4000), // 1000 tokens
      makeMessage("user", 100), // 25 tokens
      makeMessage("assistant", 100), // 25 tokens
    ];
    // From the end: msg[3] (25) + msg[2] (25) + msg[1] (1000) + msg[0] (1000) = 2050 > 2000
    // So msg[0] doesn't fit; result is last 3 messages
    const result = truncateToTokenBudget(messages, 8000);
    expect(result).toEqual(messages.slice(1));
  });

  describe("properties", () => {
    const arbMessage = fc
      .record({
        role: fc.constantFrom("user" as const, "assistant" as const),
        content: fc.string({ minLength: 0, maxLength: 2000 }),
      })
      .map((m): ChatMessage => m);

    const arbContextLength = fc.oneof(
      fc.constant(null as number | null),
      fc.integer({ min: 1000, max: 500_000 }),
    );

    test("output length never exceeds 50", () => {
      fc.assert(
        fc.property(
          fc.array(arbMessage, { minLength: 0, maxLength: 120 }),
          arbContextLength,
          (messages, ctx) => truncateToTokenBudget(messages, ctx).length <= 50,
        ),
      );
    });

    test("output estimated tokens fit within computed budget", () => {
      fc.assert(
        fc.property(
          fc.array(arbMessage, { minLength: 0, maxLength: 120 }),
          arbContextLength,
          (messages, ctx) => {
            const result = truncateToTokenBudget(messages, ctx);
            const totalTokens = result.reduce(
              (sum, m) => sum + Math.ceil(m.content.length / 4),
              0,
            );
            const effectiveCtx = ctx ?? 16384;
            const budget = Math.max(effectiveCtx - 6000, 2000);
            return totalTokens <= budget;
          },
        ),
      );
    });

    test("output is a contiguous suffix of input", () => {
      fc.assert(
        fc.property(
          fc.array(arbMessage, { minLength: 0, maxLength: 120 }),
          arbContextLength,
          (messages, ctx) => {
            const result = truncateToTokenBudget(messages, ctx);
            if (result.length === 0) return true;
            const capped = messages.slice(-50);
            const offset = capped.length - result.length;
            return result.every((m, i) => m === capped[offset + i]);
          },
        ),
      );
    });
  });
});
