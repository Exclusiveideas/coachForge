"use client";

import { useState } from "react";

const THINKING_TEXTS = [
  "Pondering your question...",
  "Crafting a thoughtful response...",
  "Digging into my knowledge base...",
  "Connecting the dots...",
  "Thinking this through...",
  "Analyzing your question...",
  "Putting thoughts together...",
  "Reflecting on this...",
  "Considering the best approach...",
  "Gathering my thoughts...",
  "Processing your message...",
  "Working through this...",
  "Formulating a response...",
  "Let me think about that...",
  "Exploring possibilities...",
  "Weighing different angles...",
  "Synthesizing an answer...",
  "Mulling this over...",
  "Assembling my thoughts...",
  "Brewing up a response...",
] as const;

function pickRandomThinkingText(): string {
  return THINKING_TEXTS[Math.floor(Math.random() * THINKING_TEXTS.length)];
}

export function ThinkingIndicator() {
  const [text] = useState(pickRandomThinkingText);

  const baseText = text.replace(/\.{1,}$/, "");

  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 text-white/60 text-sm">
        <span className="italic">{baseText}</span>
        <div className="flex gap-0.5 items-center">
          <span
            className="w-1.5 h-1.5 bg-accent-orange/70 rounded-full animate-[ripple_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-accent-orange/70 rounded-full animate-[ripple_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-accent-orange/70 rounded-full animate-[ripple_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}
