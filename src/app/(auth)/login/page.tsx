"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setResent(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.unverified) {
          setUnverified(true);
        }
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-dark-brown">
            Coach<span className="text-accent-orange italic">Forge</span>
          </h1>
          <p className="text-warm-brown mt-2">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-error text-sm px-4 py-3 rounded-lg">
              {error}
              {unverified && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resent}
                  className="block mt-2 text-accent-orange hover:underline font-medium"
                >
                  {resent ? "Verification email sent!" : resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-dark-brown">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-xs text-accent-orange hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-brown text-white py-2.5 rounded-lg font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-warm-brown">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-accent-orange hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
