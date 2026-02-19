"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

interface Feedback {
  id: string;
  sessionId: string;
  subject: string;
  content: string;
  submittedAt: string | Date;
  ipAddress: string | null;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeedbackDetailModal({
  feedback,
  onClose,
}: {
  feedback: Feedback;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 relative max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-warm-brown hover:text-dark-brown"
        >
          <X size={20} />
        </button>

        <div className="mb-4 pr-8">
          <h2 className="font-serif text-xl font-bold text-dark-brown">
            {feedback.subject}
          </h2>
          <p className="text-xs text-warm-brown mt-1">
            {formatDate(feedback.submittedAt)} · Session:{" "}
            {feedback.sessionId.slice(0, 8)}...
          </p>
        </div>

        <div className="overflow-y-auto flex-1">
          <p className="text-sm text-dark-brown/80 whitespace-pre-wrap leading-relaxed">
            {feedback.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeedbackList({ feedbacks }: { feedbacks: Feedback[] }) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  if (feedbacks.length === 0) {
    return (
      <div className="mt-6 bg-white border border-border rounded-xl p-12 text-center text-warm-brown">
        <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
        <p className="font-medium">No feedback yet</p>
        <p className="text-sm mt-1">
          Feedback submitted through the widget will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 bg-white border border-border rounded-xl divide-y divide-border">
        {feedbacks.map((fb) => (
          <button
            key={fb.id}
            type="button"
            onClick={() => setSelectedFeedback(fb)}
            className="w-full text-left p-5 hover:bg-cream/50 transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-dark-brown">{fb.subject}</h4>
              <span className="text-xs text-warm-brown shrink-0 ml-4">
                {formatDate(fb.submittedAt)}
              </span>
            </div>
            <p className="text-sm text-dark-brown/80 line-clamp-2">
              {fb.content}
            </p>
            <p className="text-xs text-warm-brown mt-2">
              Session: {fb.sessionId.slice(0, 8)}...
            </p>
          </button>
        ))}
      </div>

      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </>
  );
}
