// =============================================================================
// Andromeda — Seller Profile Editor Client Component
// =============================================================================

"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, CheckCircle, UserCircle } from "lucide-react";
import { updateSellerProfile } from "@/lib/actions/seller";

interface Props {
  seller: {
    id: string;
    businessName: string;
    description: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    businessHours: string;
  };
}

export default function ProfileEditorClient({ seller }: Props) {
  const [form, setForm] = useState({ ...seller });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await updateSellerProfile({
        businessName: form.businessName,
        description: form.description,
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        website: form.website,
        businessHours: form.businessHours,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || "Failed to save");
      }
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 text-white">
          <UserCircle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">Store Profile</h1>
          <p className="text-xs text-on-surface-variant">Edit your business details, contact info, and opening hours.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Business Info */}
        <fieldset className="rounded-xl border border-outline-variant/20 bg-surface-card p-5">
          <legend className="text-xs font-bold text-primary px-2 -ml-1">Business Information</legend>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Business Name *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                required
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none"
              />
            </div>
          </div>
        </fieldset>

        {/* Address */}
        <fieldset className="rounded-xl border border-outline-variant/20 bg-surface-card p-5">
          <legend className="text-xs font-bold text-primary px-2 -ml-1">Address</legend>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Address Line</label>
              <input
                type="text"
                value={form.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset className="rounded-xl border border-outline-variant/20 bg-surface-card p-5">
          <legend className="text-xs font-bold text-primary px-2 -ml-1">Contact Details</legend>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://"
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              />
            </div>
          </div>
        </fieldset>

        {/* Business Hours */}
        <fieldset className="rounded-xl border border-outline-variant/20 bg-surface-card p-5">
          <legend className="text-xs font-bold text-primary px-2 -ml-1">Business Hours (JSON)</legend>
          <div className="mt-2">
            <textarea
              rows={4}
              value={form.businessHours}
              onChange={(e) => handleChange("businessHours", e.target.value)}
              placeholder='{"mon-sat": "10:00-21:00", "sun": "11:00-19:00"}'
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none"
            />
            <p className="mt-1 text-[10px] text-on-surface-variant">
              Format: keys are day ranges (mon-sat, sun), values are time ranges (10:00-21:00) or "closed".
            </p>
          </div>
        </fieldset>

        {/* Submit */}
        {error && (
          <p className="text-xs font-bold text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
