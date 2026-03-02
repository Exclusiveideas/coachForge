"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

function formatPrice(pricePerToken: string): string {
  const perMillion = parseFloat(pricePerToken) * 1_000_000;
  if (perMillion === 0) return "Free";
  if (perMillion < 0.01) return "<$0.01/M";
  return `$${perMillion.toFixed(2)}/M`;
}

function formatContext(contextLength: number): string {
  if (contextLength >= 1_000_000)
    return `${(contextLength / 1_000_000).toFixed(1)}M`;
  return `${Math.round(contextLength / 1000)}k`;
}

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (modelId: string) => void;
}) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => setModels(data.models || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedModel = models.find((m) => m.id === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full px-4 py-2.5 border border-border rounded-lg bg-cream text-left text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange",
          !value && "text-warm-brown",
        )}
      >
        {loading
          ? "Loading models..."
          : selectedModel
            ? selectedModel.name
            : "Select a model..."}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange"
              placeholder="Search models..."
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-warm-brown">
                No models found
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left hover:bg-cream/80 transition flex items-center justify-between gap-2",
                    m.id === value && "bg-accent-orange/5",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-dark-brown truncate">
                      {m.name}
                    </div>
                    <div className="text-xs text-warm-brown truncate">
                      {m.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-warm-brown shrink-0">
                    <span>{formatContext(m.context_length)} ctx</span>
                    <span>{formatPrice(m.pricing.prompt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
