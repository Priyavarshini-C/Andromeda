// =============================================================================
// Andromeda — Forgot Password Page
// =============================================================================

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Mail, Loader2, ArrowLeft, CheckCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return (
      <>
        <div className="text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 border border-success/20 mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">
            Check Your Console
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
            If an account exists for <span className="font-bold text-on-surface">{email}</span>, 
            a reset link has been printed to the{" "}
            <span className="font-bold text-secondary">server console</span>{" "}
            (MVP mode — no SMTP configured).
          </p>
        </div>

        <div className="mt-6 p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-sm text-on-surface-variant">
          <p className="font-semibold text-secondary mb-1">📋 How to find it:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
            <li>Open your terminal where <code className="bg-surface px-1 rounded">npm run dev</code> is running</li>
            <li>Look for the <code className="bg-surface px-1 rounded">[Andromeda] Password Reset Link</code> block</li>
            <li>Copy the URL and paste it in your browser</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 mx-auto mb-4">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-extrabold text-primary tracking-tight">
          Forgot Password?
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Enter your account email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="reset-email" className="block text-sm font-semibold text-on-surface">
            Email Address
          </label>
          <div className="mt-1 relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-outline" />
            </div>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant bg-surface-card rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-observatory cursor-pointer disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : null}
          Send Reset Link
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </form>
    </>
  );
}
