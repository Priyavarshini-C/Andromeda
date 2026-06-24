// =============================================================================
// Andromeda — Reset Password Page
// =============================================================================

"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth";
import { Eye, EyeOff, Lock, Loader2, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isInvalidLink = !token || !email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword({ email, token, newPassword });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (isInvalidLink) {
    return (
      <>
        <div className="text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-error/20 to-error/10 border border-error/20 mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-error" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">
            Invalid Link
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            This password reset link is missing required parameters. Please request a new one.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Request a new link
          </Link>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <div className="text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 border border-success/20 mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">
            Password Updated!
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Your password has been successfully reset. You can now sign in with your new credentials.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/login"
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-container transition-all shadow-observatory cursor-pointer"
          >
            Go to Login
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 mx-auto mb-4">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-extrabold text-primary tracking-tight">
          Set New Password
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Choose a strong password for{" "}
          <span className="font-bold text-on-surface">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="new-password" className="block text-sm font-semibold text-on-surface">
            New Password
          </label>
          <div className="mt-1 relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-outline" />
            </div>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-outline-variant bg-surface-card rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-sm transition-all"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    newPassword.length >= level * 3
                      ? level <= 2
                        ? "bg-error"
                        : level === 3
                        ? "bg-amber-500"
                        : "bg-success"
                      : "bg-outline-variant/30"
                  }`}
                />
              ))}
              <span className="text-[10px] text-on-surface-variant font-medium">
                {newPassword.length < 6 ? "Weak" : newPassword.length < 9 ? "Fair" : newPassword.length < 12 ? "Good" : "Strong"}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-semibold text-on-surface">
            Confirm Password
          </label>
          <div className="mt-1 relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-outline" />
            </div>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm transition-all bg-surface-card ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-error focus:border-error"
                  : "border-outline-variant focus:border-secondary"
              }`}
              placeholder="Repeat your password"
            />
          </div>
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="mt-1 text-xs text-error">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || (!!confirmPassword && confirmPassword !== newPassword)}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-observatory cursor-pointer disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : null}
          Reset Password
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
