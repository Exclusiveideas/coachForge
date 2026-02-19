"use client";

import Link from "next/link";

interface Coach {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tone: string;
}

export function CoachCard({
  coach,
  onPreview,
  onEmbed,
}: {
  coach: Coach;
  onPreview: () => void;
  onEmbed: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-border-dark transition">
      <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
        {coach.emoji}
      </div>

      <Link
        href={`/coaches/${coach.id}/settings`}
        className="flex-1 min-w-0"
      >
        <h3 className="font-semibold text-dark-brown truncate">{coach.name}</h3>
        <p className="text-sm text-warm-brown truncate">
          {coach.tone} · {coach.description}
        </p>
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onPreview}
          className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-cream transition"
        >
          Preview
        </button>
        <button
          onClick={onEmbed}
          className="px-3 py-1.5 text-sm font-medium bg-accent-orange text-white rounded-lg hover:bg-accent-orange-hover transition"
        >
          Embed
        </button>
      </div>
    </div>
  );
}
