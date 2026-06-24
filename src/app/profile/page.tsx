// =============================================================================
// Andromeda — Customer Profile Page
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Shield, Edit3, Save, X, Heart, Scale,
  LayoutDashboard, Clock, CheckCircle2, Settings
} from "lucide-react";
import Link from "next/link";

interface FormState {
  name: string;
  phone: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", phone: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        phone: (session.user as any).phone || "",
      });
    }
  }, [session, status, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In production: call a PATCH /api/user/profile endpoint
      // For now, simulate a save
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const user = session?.user;
  const role = (user as any)?.role || "user";

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse">
        <div className="h-8 w-48 bg-surface-container rounded mb-6" />
        <div className="h-48 bg-surface-container rounded-xl mb-4" />
        <div className="h-64 bg-surface-container rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Header */}
      <div className="mb-8 border-b border-outline-variant/20 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My Profile</h1>
        <p className="mt-2 text-sm text-on-surface-variant font-medium">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface-card rounded-xl border border-outline-variant shadow-observatory overflow-hidden mb-6">
        {/* Avatar & Name Header */}
        <div className="gradient-hero text-white p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-2xl border-2 border-white/20 shrink-0">
            {(user.name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{user.name || "Andromeda User"}</h2>
            <p className="text-sm text-white/70 truncate">{user.email}</p>
            <span className={`mt-1 inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              role === "admin" ? "bg-error/30 text-white" :
              role === "seller" ? "bg-tertiary/30 text-white" :
              "bg-white/20 text-white"
            }`}>
              <Shield className="h-2.5 w-2.5" />
              {role}
            </span>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {/* Info / Form */}
        <div className="p-6">
          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface-variant cursor-not-allowed"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed here. Contact support.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Full Name", value: user.name || "—" },
                { icon: Mail, label: "Email", value: user.email || "—" },
                { icon: Phone, label: "Phone", value: (user as any).phone || "—" },
                { icon: Shield, label: "Account Role", value: role.charAt(0).toUpperCase() + role.slice(1) },
                { icon: Clock, label: "Member Since", value: "June 2026" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</dt>
                    <dd className="text-sm font-semibold text-on-surface mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/wishlist" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface-card hover:shadow-observatory-lifted hover:border-secondary/20 transition-all group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10 text-error group-hover:scale-110 transition-transform">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Wishlist</p>
            <p className="text-[11px] text-on-surface-variant">Saved products</p>
          </div>
        </Link>
        <Link href="/compare" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface-card hover:shadow-observatory-lifted hover:border-secondary/20 transition-all group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Compare</p>
            <p className="text-[11px] text-on-surface-variant">Active comparisons</p>
          </div>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface-card hover:shadow-observatory-lifted hover:border-secondary/20 transition-all group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Settings</p>
            <p className="text-[11px] text-on-surface-variant">Preferences & security</p>
          </div>
        </Link>
        {(role === "seller" || role === "admin") && (
          <Link href="/dashboard" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface-card hover:shadow-observatory-lifted hover:border-secondary/20 transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary group-hover:scale-110 transition-transform">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Dashboard</p>
              <p className="text-[11px] text-on-surface-variant">Seller controls</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
