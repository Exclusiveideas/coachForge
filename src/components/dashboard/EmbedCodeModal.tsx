"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface Coach {
  id: string;
  name: string;
  emoji: string;
  embedCode: string;
}

export function EmbedCodeModal({
  coach,
  onClose,
}: {
  coach: Coach;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const embedSnippet = `<!-- CoachForge: ${coach.name} -->
<script
  src="${appUrl}/widget.js"
  data-coach-id="${coach.id}"
></script>`;

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
          &ldquo;{coach.name}&rdquo; is Ready 🎉
        </h2>
        <p className="text-warm-brown text-sm mb-5">
          Paste this embed code anywhere. Works on any HTML page, Webflow,
          WordPress, Notion, or Framer.
        </p>

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
          ℹ️ The embed code loads a lightweight script that renders a floating
          chat bubble powered by OpenAI.
        </div>
      </div>
    </div>
  );
}
