"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TONES, EMOJI_OPTIONS } from "@/lib/validation/coach";
import { cn } from "@/lib/utils";

export function CreateCoachForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<string>("Professional");
  const [emoji, setEmoji] = useState<string>("🎯");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, tone, emoji }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create coach");
        return;
      }

      toast.success("Coach created!");
      setName("");
      setDescription("");
      setTone("Professional");
      setEmoji("🎯");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <p className="text-sm font-semibold tracking-widest text-accent-orange uppercase mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-accent-orange rounded-full" />
        Create a Coach
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">
            Coach Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
            placeholder="e.g. Alex the Sales Coach"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">
            Describe your coach in plain English
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition resize-none"
            placeholder="e.g. You are Alex, an expert sales coach who helps SDRs improve their cold outreach. You are direct, encouraging, and give concrete examples."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-2">
            Tone / Personality
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium border transition",
                  tone === t
                    ? "bg-dark-brown text-white border-dark-brown"
                    : "bg-cream text-dark-brown border-border hover:border-dark-brown/30"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-2">
            Emoji / Avatar
          </label>
          <div className="flex gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "w-10 h-10 rounded-lg text-lg flex items-center justify-center border transition",
                  emoji === e
                    ? "bg-accent-orange/10 border-accent-orange"
                    : "bg-cream border-border hover:border-dark-brown/30"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dark-brown text-white py-3 rounded-lg font-medium hover:bg-dark-brown/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Creating..." : "Create Coach"} →
        </button>
      </form>
    </div>
  );
}
