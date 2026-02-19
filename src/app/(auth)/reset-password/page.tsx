"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-warm-brown">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (token) {
    return <ResetForm token={token} />;
  }

  return <RequestForm />;
}

function RequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white border border-border rounded-xl p-8">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="font-serif text-2xl font-bold text-dark-brown mb-2">
              Check your email
            </h2>
            <p className="text-warm-brown text-sm mb-6">
              If an account exists with that email, you&apos;ll receive a
              password reset link shortly.
            </p>
            <Link
              href="/login"
              className="text-accent-orange hover:underline text-sm font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-dark-brown">
            Coach<span className="text-accent-orange italic">Forge</span>
          </h1>
          <p className="text-warm-brown mt-2">Reset your password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-error text-sm px-4 py-3 rounded-lg">
              {error}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-brown text-white py-2.5 rounded-lg font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-warm-brown">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-accent-orange hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white border border-border rounded-xl p-8">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="font-serif text-2xl font-bold text-dark-brown mb-2">
              Password reset!
            </h2>
            <p className="text-warm-brown text-sm mb-6">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
            <Link
              href="/login"
              className="inline-block bg-dark-brown text-white px-6 py-2.5 rounded-lg font-medium hover:bg-dark-brown/90 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-dark-brown">
            Coach<span className="text-accent-orange italic">Forge</span>
          </h1>
          <p className="text-warm-brown mt-2">Set a new password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-error text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-1.5">
              New Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-1.5">
              Confirm New Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-brown text-white py-2.5 rounded-lg font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
