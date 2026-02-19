"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TONES, EMOJI_OPTIONS } from "@/lib/validation/coach";
import { cn } from "@/lib/utils";

interface Coach {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tone: string;
  systemPrompt: string | null;
  welcomeMessage: string;
}

export function SettingsForm({ coach }: { coach: Coach }) {
  const router = useRouter();
  const [name, setName] = useState(coach.name);
  const [description, setDescription] = useState(coach.description);
  const [emoji, setEmoji] = useState(coach.emoji);
  const [tone, setTone] = useState(coach.tone);
  const [systemPrompt, setSystemPrompt] = useState(coach.systemPrompt || "");
  const [welcomeMessage, setWelcomeMessage] = useState(coach.welcomeMessage);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          emoji,
          tone,
          systemPrompt: systemPrompt || null,
          welcomeMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        return;
      }

      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this coach? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/coaches/${coach.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete coach");
        return;
      }
      toast.success("Coach deleted");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6 mt-6">
      <div className="bg-white border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">
            Coach Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition resize-none"
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

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">
            Welcome Message
          </label>
          <input
            type="text"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">
            System Prompt{" "}
            <span className="text-warm-brown font-normal">(optional override)</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition resize-none font-mono text-sm"
            placeholder="Leave empty to auto-generate from name, description, and tone"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-error hover:underline disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Coach"}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-dark-brown text-white rounded-lg font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
