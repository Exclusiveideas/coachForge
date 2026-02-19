"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@/lib/auth/server-session";

export function DashboardHeader({ user }: { user: AuthUser }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/dashboard" className="font-serif text-2xl font-bold text-dark-brown">
          Coach<span className="text-accent-orange italic">Forge</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-warm-brown">{user.name || user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-warm-brown hover:text-dark-brown transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
