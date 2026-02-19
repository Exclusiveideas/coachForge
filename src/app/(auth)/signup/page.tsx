"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
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
              We&apos;ve sent a verification link to <strong className="text-dark-brown">{email}</strong>.
              Please click the link to activate your account.
            </p>
            <Link
              href="/login"
              className="text-accent-orange hover:underline text-sm font-medium"
            >
              Go to sign in
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
          <p className="text-warm-brown mt-2">Create your account</p>
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange transition"
              placeholder="Your name"
              required
            />
          </div>

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
            <label className="block text-sm font-medium text-dark-brown mb-1.5">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-brown text-white py-2.5 rounded-lg font-medium hover:bg-dark-brown/90 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-warm-brown">
            Already have an account?{" "}
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
