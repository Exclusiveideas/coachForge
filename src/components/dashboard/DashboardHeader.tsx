"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@/lib/auth/server-session";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/AlertDialog";

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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-sm text-warm-brown hover:text-dark-brown transition">
                Sign out
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Sign out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? You will need to log in again to access your account.
              </AlertDialogDescription>
              <div className="mt-4 flex justify-end gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Sign out
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
