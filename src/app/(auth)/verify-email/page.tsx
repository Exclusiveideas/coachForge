"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-warm-brown">Verifying...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    // Prevent double-fire from React Strict Mode
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white border border-border rounded-xl p-8">
          {status === "loading" && (
            <>
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="font-serif text-2xl font-bold text-dark-brown mb-2">
                Verifying your email...
              </h2>
              <p className="text-warm-brown text-sm">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-4xl mb-4">✅</div>
              <h2 className="font-serif text-2xl font-bold text-dark-brown mb-2">
                Email verified!
              </h2>
              <p className="text-warm-brown text-sm mb-6">
                {message}. You can now sign in to your account.
              </p>
              <Link
                href="/login"
                className="inline-block bg-dark-brown text-white px-6 py-2.5 rounded-lg font-medium hover:bg-dark-brown/90 transition"
              >
                Sign in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-4xl mb-4">❌</div>
              <h2 className="font-serif text-2xl font-bold text-dark-brown mb-2">
                Verification failed
              </h2>
              <p className="text-warm-brown text-sm mb-6">{message}</p>
              <Link
                href="/login"
                className="text-accent-orange hover:underline text-sm font-medium"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
