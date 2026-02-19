"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, FileText, HelpCircle, Globe, Upload, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/AlertDialog";

interface Knowledge {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  chunkCount: number;
  error: string | null;
  createdAt: string | Date;
}

type AddMode = "TEXT" | "FAQ" | "URL" | "DOCUMENT" | null;

export function KnowledgePageClient({
  coachId,
  initialKnowledge,
}: {
  coachId: string;
  initialKnowledge: Knowledge[];
}) {
  const router = useRouter();
  const [addMode, setAddMode] = useState<AddMode>(null);

  const hasProcessing = initialKnowledge.some(
    (k) => k.status === "PENDING" || k.status === "PROCESSING"
  );

  useEffect(() => {
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [hasProcessing, router]);

  return (
    <div className="mt-6 space-y-6">
      {/* Add Knowledge Actions */}
      <div className="flex flex-wrap gap-2">
        {([
          { type: "TEXT" as const, label: "Add Text", icon: FileText },
          { type: "FAQ" as const, label: "Add FAQ", icon: HelpCircle },
          { type: "URL" as const, label: "Add URL", icon: Globe },
          { type: "DOCUMENT" as const, label: "Upload Document", icon: Upload },
        ]).map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setAddMode(addMode === type ? null : type)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition",
              addMode === type
                ? "bg-dark-brown text-white border-dark-brown"
                : "bg-white border-border text-dark-brown hover:border-border-dark"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-white text-warm-brown hover:text-dark-brown transition ml-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Add Form */}
      {addMode && addMode !== "DOCUMENT" && (
        <AddKnowledgeForm
          coachId={coachId}
          type={addMode}
          onClose={() => setAddMode(null)}
        />
      )}
      {addMode === "DOCUMENT" && (
        <UploadDocumentForm coachId={coachId} onClose={() => setAddMode(null)} />
      )}

      {/* Knowledge List */}
      <div className="bg-white border border-border rounded-xl divide-y divide-border">
        {initialKnowledge.length === 0 ? (
          <div className="text-center py-12 text-warm-brown">
            <FileText size={32} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No knowledge items yet</p>
            <p className="text-sm mt-1">Add text, FAQs, URLs, or documents to train your coach</p>
          </div>
        ) : (
          initialKnowledge.map((item) => (
            <KnowledgeItem key={item.id} item={item} coachId={coachId} />
          ))
        )}
      </div>
    </div>
  );
}

function AddKnowledgeForm({
  coachId,
  type,
  onClose,
}: {
  coachId: string;
  type: "TEXT" | "FAQ" | "URL";
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const placeholders: Record<string, { title: string; content: string }> = {
    TEXT: {
      title: "e.g. Company Overview",
      content: "Paste your text content here...",
    },
    FAQ: {
      title: "e.g. Common Questions",
      content: "Q: What is your return policy?\nA: We offer 30-day returns.\n\nQ: How do I contact support?\nA: Email support@example.com",
    },
    URL: {
      title: "e.g. Product Documentation",
      content: "https://example.com/docs",
    },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/coaches/${coachId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add knowledge");
        return;
      }

      toast.success("Knowledge added! Processing...");
      onClose();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-xl p-5 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-dark-brown mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
          placeholder={placeholders[type].title}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-brown mb-1.5">
          {type === "URL" ? "URL" : "Content"}
        </label>
        {type === "URL" ? (
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
            placeholder={placeholders[type].content}
            required
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={type === "FAQ" ? 8 : 5}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition resize-none"
            placeholder={placeholders[type].content}
            required
          />
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-dark-brown text-white rounded-lg text-sm font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Knowledge"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-cream transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function UploadDocumentForm({
  coachId,
  onClose,
}: {
  coachId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);

      const res = await fetch(`/api/coaches/${coachId}/knowledge/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
        return;
      }

      toast.success("Document uploaded! Processing...");
      onClose();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-xl p-5 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-dark-brown mb-1.5">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
          placeholder="e.g. Product Manual"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-brown mb-1.5">
          File (PDF, DOC, DOCX, or TXT - max 10MB)
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-warm-brown file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-brown file:text-white file:text-sm file:font-medium hover:file:bg-dark-brown/90"
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !file}
          className="px-5 py-2 bg-dark-brown text-white rounded-lg text-sm font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-cream transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function KnowledgeItem({
  item,
  coachId,
}: {
  item: Knowledge;
  coachId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/coaches/${coachId}/knowledge/${item.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        toast.error("Failed to delete");
        return;
      }
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  const typeIcons: Record<string, typeof FileText> = {
    TEXT: FileText,
    FAQ: HelpCircle,
    URL: Globe,
    DOCUMENT: Upload,
  };
  const Icon = typeIcons[item.type] || FileText;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 bg-cream rounded-lg flex items-center justify-center text-warm-brown shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-dark-brown text-sm truncate">
          {item.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-warm-brown uppercase">{item.type}</span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              statusColors[item.status]
            )}
          >
            {item.status}
          </span>
          {item.chunkCount > 0 && (
            <span className="text-xs text-warm-brown">
              {item.chunkCount} chunks
            </span>
          )}
        </div>
        {item.error && (
          <p className="text-xs text-error mt-1 truncate">{item.error}</p>
        )}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            className="text-warm-brown hover:text-error transition shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete knowledge item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{item.title}&rdquo;? This will remove all associated chunks and embeddings. This action cannot be undone.
          </AlertDialogDescription>
          <div className="mt-4 flex justify-end gap-3">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-accent-red text-white hover:bg-accent-red/90 transition disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
