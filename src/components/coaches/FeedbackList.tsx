"use client";

import { MessageSquare } from "lucide-react";

interface Feedback {
  id: string;
  sessionId: string;
  subject: string;
  content: string;
  submittedAt: string | Date;
  ipAddress: string | null;
}

export function FeedbackList({ feedbacks }: { feedbacks: Feedback[] }) {
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
    <div className="mt-6 bg-white border border-border rounded-xl divide-y divide-border">
      {feedbacks.map((fb) => (
        <div key={fb.id} className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-dark-brown">{fb.subject}</h4>
            <span className="text-xs text-warm-brown shrink-0 ml-4">
              {new Date(fb.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-sm text-dark-brown/80 whitespace-pre-wrap">
            {fb.content}
          </p>
          <p className="text-xs text-warm-brown mt-2">
            Session: {fb.sessionId.slice(0, 8)}...
          </p>
        </div>
      ))}
    </div>
  );
}
