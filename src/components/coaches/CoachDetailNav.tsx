"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, BookOpen, MessageSquare } from "lucide-react";

const tabs = [
  { label: "Settings", href: "settings", icon: Settings },
  { label: "Knowledge Base", href: "knowledge", icon: BookOpen },
  { label: "Feedback", href: "feedback", icon: MessageSquare },
];

export function CoachDetailNav({ coachId }: { coachId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const href = `/coaches/${coachId}/${tab.href}`;
        const active = pathname === href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition",
              active
                ? "border-accent-orange text-dark-brown"
                : "border-transparent text-warm-brown hover:text-dark-brown"
            )}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
