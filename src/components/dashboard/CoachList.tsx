"use client";

import { useState } from "react";
import { CoachCard } from "./CoachCard";
import { EmbedCodeModal } from "./EmbedCodeModal";
import { PreviewModal } from "./PreviewModal";

interface Coach {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tone: string;
  embedCode: string;
  welcomeMessage: string;
  systemPrompt: string | null;
  _count: { knowledgeBase: number; feedbacks: number };
}

export function CoachList({ initialCoaches }: { initialCoaches: Coach[] }) {
  const [embedCoach, setEmbedCoach] = useState<Coach | null>(null);
  const [previewCoach, setPreviewCoach] = useState<Coach | null>(null);

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <p className="text-sm font-semibold tracking-widest text-accent-orange uppercase mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-accent-orange rounded-full" />
        Your Coaches
      </p>

      {initialCoaches.length === 0 ? (
        <div className="text-center py-12 text-warm-brown">
          <p className="text-lg mb-1">No coaches yet</p>
          <p className="text-sm">Create your first coach to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialCoaches.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              onPreview={() => setPreviewCoach(coach)}
              onEmbed={() => setEmbedCoach(coach)}
            />
          ))}
        </div>
      )}

      {embedCoach && (
        <EmbedCodeModal
          coach={embedCoach}
          onClose={() => setEmbedCoach(null)}
        />
      )}

      {previewCoach && (
        <PreviewModal
          coach={previewCoach}
          onClose={() => setPreviewCoach(null)}
        />
      )}
    </div>
  );
}
