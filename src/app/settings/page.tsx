// =============================================================================
// Andromeda — Account Settings Page
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell, Moon, Sun, Shield, Trash2, AlertTriangle,
  CheckCircle2, ChevronRight, LogOut, Lock, Eye, EyeOff,
  Monitor
} from "lucide-react";
import Link from "next/link";

type Theme = "system" | "light" | "dark";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Theme
  const [theme, setTheme] = useState<Theme>("system");
  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [sellerUpdates, setSellerUpdates] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // Change Password
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notif saved
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    // Load saved theme from localStorage
    const stored = localStorage.getItem("andromeda-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, [status, router]);

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("andromeda-theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else if (t === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSaveNotifs = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    // Simulate API call — wire to PATCH /api/user/password in production
    await new Promise((r) => setTimeout(r, 900));
    setPwSaved(true);
    setShowPwForm(false);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
    setPwSaving(false);
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse">
        <div className="h-8 w-48 bg-surface-container rounded mb-6" />
        <div className="h-48 bg-surface-container rounded-xl mb-4" />
        <div className="h-64 bg-surface-container rounded-xl" />
      </div>
    );
  }

  if (!session?.user) return null;

  const inputCls =
    "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all";
  const labelCls = "block text-xs font-bold text-on-surface-variant mb-1.5";

  const themeOptions: { value: Theme; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
  ];

  const ToggleRow = ({
    label, desc, checked, onChange
  }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant/30 last:border-0">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
          checked ? "bg-secondary" : "bg-surface-container"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Header */}
      <div className="mb-8 border-b border-outline-variant/20 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-on-surface-variant font-medium">
          Manage your preferences and account security.
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-surface-card rounded-xl border border-outline-variant shadow-observatory overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center gap-2">
          <Sun className="h-4 w-4 text-secondary" />
          <h2 className="text-sm font-bold text-primary">Appearance</h2>
        </div>
        <div className="p-6">
          <p className="text-xs text-on-surface-variant mb-4">
            Choose how Andromeda looks in your browser.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  theme === value
                    ? "border-secondary bg-secondary/5"
                    : "border-outline-variant hover:border-secondary/30"
                }`}
              >
                <Icon className={`h-5 w-5 ${theme === value ? "text-secondary" : "text-on-surface-variant"}`} />
                <span className={`text-xs font-bold ${theme === value ? "text-secondary" : "text-on-surface-variant"}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-card rounded-xl border border-outline-variant shadow-observatory overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center gap-2">
          <Bell className="h-4 w-4 text-secondary" />
          <h2 className="text-sm font-bold text-primary">Notifications</h2>
        </div>
        <div className="p-6">
          <ToggleRow
            label="Email Notifications"
            desc="Receive account-related emails and updates"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <ToggleRow
            label="Price Drop Alerts"
            desc="Get notified when prices drop on wishlisted items"
            checked={priceAlerts}
            onChange={setPriceAlerts}
          />
          <ToggleRow
            label="Seller Updates"
            desc="Updates from sellers whose products you follow"
            checked={sellerUpdates}
            onChange={setSellerUpdates}
          />
          <ToggleRow
            label="Andromeda Newsletter"
            desc="Weekly digest of trending deals and new features"
            checked={newsletter}
            onChange={setNewsletter}
          />
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleSaveNotifs}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Preferences
            </button>
            {notifSaved && (
              <span className="flex items-center gap-1.5 text-sm text-success font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Saved!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface-card rounded-xl border border-outline-variant shadow-observatory overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center gap-2">
          <Shield className="h-4 w-4 text-secondary" />
          <h2 className="text-sm font-bold text-primary">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          {pwSaved && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Password changed successfully!
            </div>
          )}

          {!showPwForm ? (
            <button
              onClick={() => setShowPwForm(true)}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-outline-variant hover:border-secondary/30 hover:bg-surface-container transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-on-surface">Change Password</p>
                  <p className="text-xs text-on-surface-variant">Update your login password</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-secondary transition-colors" />
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 rounded-xl border border-outline-variant p-5">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Lock className="h-4 w-4 text-secondary" /> Change Password
              </h3>
              {pwError && (
                <div className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error font-semibold">
                  {pwError}
                </div>
              )}
              {/* Current */}
              <div>
                <label className={labelCls}>Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    placeholder="Your current password"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* New */}
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <input
                    type={showNext ? "text" : "password"}
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    placeholder="Min 8 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowNext(!showNext)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer">
                    {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="Repeat new password"
                  className={inputCls}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {pwSaving && <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {pwSaving ? "Saving..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPwForm(false); setPwError(null); setPwForm({ current: "", next: "", confirm: "" }); }}
                  className="inline-flex items-center rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Linked Accounts info */}
          <div className="flex items-center justify-between w-full p-4 rounded-xl border border-outline-variant bg-surface-container/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Two-Factor Authentication</p>
                <p className="text-xs text-on-surface-variant">Coming soon in Andromeda v2</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
              Soon
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface-card rounded-xl border border-error/20 shadow-observatory overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-error/20 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-error" />
          <h2 className="text-sm font-bold text-error">Danger Zone</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">Sign Out of All Devices</p>
              <p className="text-xs text-on-surface-variant">End all active sessions across every device.</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          <div className="border-t border-error/10 pt-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-error">Delete Account</p>
              <p className="text-xs text-on-surface-variant">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-2 text-sm font-bold text-error hover:bg-error/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : (
              <div className="w-full rounded-xl border border-error/30 bg-error/5 p-4">
                <p className="text-sm font-bold text-error mb-3">
                  Are you absolutely sure? This action is irreversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      // In production: call DELETE /api/user endpoint then sign out
                      await signOut({ callbackUrl: "/" });
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-error text-white px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex items-center rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="flex gap-3 justify-start mt-2">
        <Link
          href="/profile"
          className="text-xs font-bold text-secondary hover:underline"
        >
          ← Back to Profile
        </Link>
      </div>
    </div>
  );
}
