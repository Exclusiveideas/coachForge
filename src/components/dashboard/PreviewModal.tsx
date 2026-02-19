"use client";

import { useState, useRef, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";

interface Coach {
  id: string;
  name: string;
  emoji: string;
  tone: string;
  welcomeMessage: string;
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

export function PreviewModal({
  coach,
  onClose,
}: {
  coach: Coach;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: coach.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: streaming ? "auto" : "smooth",
    });
  }, [messages, streaming]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setStreaming(true);

    // Add empty assistant message for streaming
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/public/chat/${coach.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: newMessages.slice(-10),
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          };
          return updated;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "content") {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: updated[updated.length - 1].content + data.content,
                  };
                  return updated;
                });
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-orange/20 rounded-xl flex items-center justify-center text-lg">
              {coach.emoji}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">{coach.name}</h3>
              <p className="text-white/50 text-xs">AI Coach · {coach.tone}</p>
            </div>
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const isStreamingThis = streaming && i === messages.length - 1 && msg.role === "assistant";
              const isEmpty = !msg.content;

              if (isStreamingThis && isEmpty) {
                return (
                  <div key={i} className="flex justify-start">
                    <ThinkingIndicator />
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent-orange text-white rounded-br-sm"
                        : "bg-white/10 text-white/90 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownMessage content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-accent-orange/50"
                placeholder="Ask me anything..."
                disabled={streaming}
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="w-10 h-10 bg-accent-orange rounded-xl flex items-center justify-center text-white hover:bg-accent-orange-hover transition disabled:opacity-50"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
