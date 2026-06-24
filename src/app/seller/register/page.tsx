// =============================================================================
// Andromeda — Seller Registration Page (Multi-Step)
// Supports: Type A (Direct Seller) and Type B (Website Seller)
// =============================================================================

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package, Globe, ChevronRight, ChevronLeft, CheckCircle2,
  Store, ArrowRight, Building, Phone, Mail, MapPin, User,
  Lock, Eye, EyeOff, FileText
} from "lucide-react";
import Link from "next/link";

// ---- Types ----
type SellerType = "direct" | "website" | null;
type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Type selection
  sellerType: SellerType;

  // Step 2: Business details
  businessName: string;
  ownerName: string;
  businessPhone: string;
  businessEmail: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  logoUrl: string;
  gstUrl: string;

  // Step 2b: Website URL (Type B only)
  websiteUrl: string;

  // Step 3: Account setup
  accountName: string;
  accountEmail: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormData = {
  sellerType: null,
  businessName: "",
  ownerName: "",
  businessPhone: "",
  businessEmail: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  gstin: "",
  logoUrl: "",
  gstUrl: "",
  websiteUrl: "",
  accountName: "",
  accountEmail: "",
  password: "",
  confirmPassword: "",
};

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
  "West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry",
];

// ---- Steps UI ----
function StepIndicator({ current, total }: { current: Step; total: number }) {
  const labels = ["Business Type", "Business Info", "Account Setup", "Verified!"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {labels.slice(0, total).map((label, i) => {
        const stepNum = (i + 1) as Step;
        const isCompleted = current > stepNum;
        const isCurrent = current === stepNum;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                isCompleted ? "bg-success text-white" :
                isCurrent ? "bg-primary text-white" :
                "bg-surface-container text-on-surface-variant"
              }`}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                isCurrent ? "text-primary" : "text-on-surface-variant"
              }`}>{label}</span>
            </div>
            {i < total - 1 && (
              <div className={`h-0.5 w-12 sm:w-16 mx-1 mb-5 transition-colors ${
                current > stepNum ? "bg-success" : "bg-surface-container"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Inner form component (needs useSearchParams) ----
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type");

  const [step, setStep] = useState<Step>(typeFromUrl ? 2 : 1);
  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    sellerType: typeFromUrl === "website" ? "website" : typeFromUrl === "direct" ? "direct" : null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGst, setUploadingGst] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "gstUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "logoUrl") setUploadingLogo(true);
    else setUploadingGst(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, [field]: data.url }));
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during upload.");
    } finally {
      if (field === "logoUrl") setUploadingLogo(false);
      else setUploadingGst(false);
    }
  };

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleTypeSelect = (type: SellerType) => {
    update("sellerType", type as string);
    setStep(2);
  };

  const handleNext = () => {
    setError(null);
    // Basic validation
    if (step === 2) {
      if (!form.businessName || !form.ownerName || !form.businessPhone || !form.city || !form.state) {
        setError("Please fill in all required fields.");
        return;
      }
      if (form.sellerType === "website" && !form.websiteUrl) {
        setError("Please provide your website URL.");
        return;
      }
    }
    if (step === 3) {
      if (!form.accountEmail || !form.password || !form.accountName) {
        setError("Please fill in all required fields.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }
    setStep((prev) => (prev + 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerType: form.sellerType,
          businessName: form.businessName,
          ownerName: form.ownerName,
          businessPhone: form.businessPhone,
          businessEmail: form.businessEmail,
          addressLine1: form.addressLine1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          gstin: form.gstin,
          websiteUrl: form.websiteUrl,
          accountName: form.accountName,
          accountEmail: form.accountEmail,
          password: form.password,
          logoUrl: form.logoUrl,
          gstUrl: form.gstUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Guard: data.error could be an object if the API returns structured errors
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : typeof data.error?.message === "string"
            ? data.error.message
            : "Registration failed. Please try again.";
        setError(errMsg);
        return;
      }
      setStep(4);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all";
  const labelCls = "block text-xs font-bold text-on-surface-variant mb-1.5";
  const requiredStar = <span className="text-error ml-0.5">*</span>;

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-12 sm:px-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ANDROMEDA
          </span>
        </Link>
        <p className="text-xs text-on-surface-variant mt-1">Seller Registration</p>
      </div>

      <StepIndicator current={step} total={4} />

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error font-medium">
          {error}
        </div>
      )}

      {/* ─── Step 1: Choose Seller Type ─── */}
      {step === 1 && (
        <div>
          <h1 className="text-xl font-bold text-primary text-center mb-2">How do you want to sell?</h1>
          <p className="text-sm text-on-surface-variant text-center mb-8">Choose the model that fits your business.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleTypeSelect("direct")}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-outline-variant bg-surface-card hover:border-primary hover:shadow-observatory-lifted transition-all cursor-pointer text-left group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Package className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Type A</p>
                <h3 className="text-base font-bold text-primary mb-2">Sell Directly</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  No website needed. List products directly on Andromeda with photos, pricing, and stock levels.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-4 py-2 text-xs font-bold">
                Choose Direct <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <button
              onClick={() => handleTypeSelect("website")}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-surface-card hover:border-secondary hover:shadow-observatory-lifted transition-all cursor-pointer text-left group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                <Globe className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Type B — Popular</p>
                <h3 className="text-base font-bold text-primary mb-2">Link Your Website</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Have your own e-commerce site? Showcase products on Andromeda and drive traffic to your store.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-white px-4 py-2 text-xs font-bold">
                Choose Website <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
          <p className="text-center text-xs text-on-surface-variant mt-6">
            Already registered?{" "}
            <Link href="/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      )}

      {/* ─── Step 2: Business Information ─── */}
      {step === 2 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            {form.sellerType === "website" ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Globe className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-primary">Business Information</h2>
              <p className="text-xs text-on-surface-variant">Tell us about your business</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Name {requiredStar}</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                  <input type="text" placeholder="Your Business Name" value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Owner / Contact Name {requiredStar}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                  <input type="text" placeholder="Full Name" value={form.ownerName}
                    onChange={(e) => update("ownerName", e.target.value)}
                    className={`${inputCls} pl-9`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Phone {requiredStar}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                  <input type="tel" placeholder="+91 98765 43210" value={form.businessPhone}
                    onChange={(e) => update("businessPhone", e.target.value)}
                    className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                  <input type="email" placeholder="business@example.com" value={form.businessEmail}
                    onChange={(e) => update("businessEmail", e.target.value)}
                    className={`${inputCls} pl-9`} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-outline" />
                <input type="text" placeholder="Street address, landmark" value={form.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City {requiredStar}</label>
                <input type="text" placeholder="City" value={form.city}
                  onChange={(e) => update("city", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State {requiredStar}</label>
                <select value={form.state} onChange={(e) => update("state", e.target.value)}
                  className={inputCls}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input type="text" placeholder="560001" value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>GSTIN (optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <input type="text" placeholder="22AAAAA0000A1Z5" value={form.gstin}
                  onChange={(e) => update("gstin", e.target.value)}
                  className={`${inputCls} pl-9 uppercase`} />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">Adding GSTIN speeds up seller verification.</p>
            </div>

            {/* Business Logo & GST Document Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Logo</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-outline overflow-hidden shrink-0">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-6 w-6" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <span className="inline-flex items-center justify-center rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full">
                      {uploadingLogo ? "Uploading..." : form.logoUrl ? "Change Logo" : "Upload Logo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "logoUrl")}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>GST / Business Document</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-outline overflow-hidden shrink-0">
                    {form.gstUrl ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <span className="inline-flex items-center justify-center rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full">
                      {uploadingGst ? "Uploading..." : form.gstUrl ? "Change Doc" : "Upload Document"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "gstUrl")}
                      disabled={uploadingGst}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Type B: Website URL */}
            {form.sellerType === "website" && (
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                <label className={`${labelCls} text-secondary`}>Your Website URL {requiredStar}</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <input type="url" placeholder="https://yourshop.com" value={form.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                    className={`${inputCls} pl-9 border-secondary/30 focus:border-secondary`} />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Customers will be redirected here when they click &quot;Buy Now&quot; on your products.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 3: Account Setup ─── */}
      {step === 3 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Create Your Account</h2>
              <p className="text-xs text-on-surface-variant">These credentials are for your Andromeda seller account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Your Full Name {requiredStar}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <input type="text" placeholder="Your name" value={form.accountName}
                  onChange={(e) => update("accountName", e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address {requiredStar}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <input type="email" placeholder="you@example.com" value={form.accountEmail}
                  onChange={(e) => update("accountEmail", e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Password {requiredStar}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={`${inputCls} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Confirm Password {requiredStar}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password" value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className={`${inputCls} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-surface-container/50 border border-outline-variant p-4 space-y-1 text-xs text-on-surface-variant">
              <p className="font-semibold text-primary mb-2">Review your details:</p>
              <p><strong>Business:</strong> {form.businessName}</p>
              <p><strong>Type:</strong> {form.sellerType === "website" ? "Type B — Website Seller" : "Type A — Direct Seller"}</p>
              {form.sellerType === "website" && <p><strong>Website:</strong> {form.websiteUrl}</p>}
              <p><strong>Location:</strong> {form.city}, {form.state}</p>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              By registering, you agree to our{" "}
              <Link href="/terms" className="text-secondary font-semibold">Terms & Conditions</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-secondary font-semibold">Privacy Policy</Link>.
              Your seller account will be reviewed and approved within 24–48 hours.
            </p>
          </div>
        </div>
      )}

      {/* ─── Step 4: Success ─── */}
      {step === 4 && (
        <div className="text-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Registration Submitted!</h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
            Welcome to Andromeda, <strong>{form.businessName}</strong>! Your seller account has been
            created and submitted for verification. Our team will review your application within
            24–48 hours and send confirmation to <strong>{form.accountEmail}</strong>.
          </p>
          <div className="bg-surface-card rounded-xl border border-outline-variant p-5 max-w-sm mx-auto mb-6 text-left">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">What happens next?</p>
            <ol className="space-y-2">
              {["Our team reviews your business details", "You receive a verification email", "Your seller badge is activated", "Start listing products!"].map((s, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-[10px] font-bold">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity">
              Sign In to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-6 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step !== 4 && (
        <div className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"}`}>
          {step > 1 && (
            <button
              onClick={() => { setError(null); setStep((prev) => (prev - 1) as Step); }}
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {step < 3 && (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-success text-white px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Outer page wraps in Suspense for useSearchParams
export default function SellerRegisterPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-full bg-surface py-4">
      <Suspense fallback={
        <div className="animate-pulse flex flex-col items-center gap-4 py-16 w-full max-w-2xl px-4">
          <div className="h-8 w-48 bg-surface-container rounded" />
          <div className="h-4 w-32 bg-surface-container rounded" />
          <div className="h-64 w-full bg-surface-container rounded-xl" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
