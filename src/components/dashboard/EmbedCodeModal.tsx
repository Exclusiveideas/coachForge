"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

type EmbedMode = "floating" | "inline";
type EmbedAlign = "center" | "left" | "right";

interface Coach {
  id: string;
  name: string;
  emoji: string;
  embedCode: string;
}

function buildSnippet(
  appUrl: string,
  coach: Coach,
  mode: EmbedMode,
  align: EmbedAlign,
) {
  const attrs = [
    `  src="${appUrl}/widget.js"`,
    `  data-coach-id="${coach.id}"`,
  ];
  if (mode === "inline") {
    attrs.push(`  data-mode="inline"`);
    if (align !== "center") {
      attrs.push(`  data-align="${align}"`);
    }
  }
  return `<!-- CoachForge: ${coach.name} -->\n<script\n${attrs.join("\n")}\n></script>`;
}

export function EmbedCodeModal({
  coach,
  onClose,
}: {
  coach: Coach;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<EmbedMode>("floating");
  const [align, setAlign] = useState<EmbedAlign>("center");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const embedSnippet = buildSnippet(appUrl, coach, mode, align);

  function handleCopy() {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-warm-brown hover:text-dark-brown"
        >
          <X size={20} />
        </button>

        <h2 className="font-serif text-2xl font-bold text-dark-brown mb-1">
          &ldquo;{coach.name}&rdquo; is Ready
        </h2>
        <p className="text-warm-brown text-sm mb-5">
          Paste this embed code anywhere. Works on any HTML page, Webflow,
          WordPress, Notion, or Framer.
        </p>

        {/* Mode toggle */}
        <div className="mb-4">
          <label className="text-sm font-medium text-dark-brown block mb-2">
            Display Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("floating")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === "floating"
                  ? "bg-accent-orange text-white"
                  : "bg-cream text-warm-brown hover:bg-cream/80"
              }`}
            >
              Floating Widget
            </button>
            <button
              onClick={() => setMode("inline")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === "inline"
                  ? "bg-accent-orange text-white"
                  : "bg-cream text-warm-brown hover:bg-cream/80"
              }`}
            >
              Inline Embed
            </button>
          </div>
        </div>

        {/* Alignment (inline only) */}
        {mode === "inline" && (
          <div className="mb-4">
            <label className="text-sm font-medium text-dark-brown block mb-2">
              Alignment
            </label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlign(a)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    align === a
                      ? "bg-accent-orange text-white"
                      : "bg-cream text-warm-brown hover:bg-cream/80"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-dark-brown rounded-xl p-4 mb-4 overflow-x-auto">
          <pre className="text-sm text-cream font-mono whitespace-pre-wrap">
            {embedSnippet}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-cream transition font-medium text-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Embed Code"}
          </button>
        </div>

        <div className="mt-4 bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-lg">
          {mode === "floating"
            ? "Floating mode shows a chat bubble in the bottom-right corner of the page."
            : "Inline mode renders the chat panel directly where you place the code."}
        </div>
      </div>
    </div>
  );
}
