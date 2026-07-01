// =============================================================================
// Andromeda — Premium Seller Registration Multi-Step Wizard (Rose Gold Overhaul)
// =============================================================================

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package, Globe, ChevronRight, ChevronLeft, CheckCircle2,
  Store, ArrowRight, Building, Phone, Mail, MapPin, User,
  Lock, Eye, EyeOff, FileText, Sparkles, Rocket
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type SellerType = "direct" | "website" | null;
type Step = 1 | 2 | 3 | 4;

interface FormData {
  sellerType: SellerType;
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
  websiteUrl: string;
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
  state: "Karnataka",
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
  "West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry"
];

function StepIndicator({ current, total }: { current: Step; total: number }) {
  const labels = ["Atelier Type", "Atelier Info", "Account Credentials", "Launched!"];
  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-10">
      {labels.map((label, i) => {
        const stepNum = (i + 1) as Step;
        const isCompleted = current > stepNum;
        const isCurrent = current === stepNum;
        
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            <div className="flex flex-col items-center z-10">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isCompleted ? "bg-[#1D9E75] text-white" :
                  isCurrent ? "bg-[#8B3A52] text-white shadow-luxury-light" :
                  "bg-white border border-[#E8D8CE] text-smoke"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" /> : stepNum}
              </div>
              <span className={`text-[9px] font-semibold uppercase tracking-wider mt-2 whitespace-nowrap ${
                isCurrent ? "text-[#8B3A52]" : "text-smoke"
              }`}>
                {label}
              </span>
            </div>

            {/* Connecting lines */}
            {i < total - 1 && (
              <div 
                className={`absolute top-4 left-1/2 right-[-50%] h-0.5 -z-0 transition-colors duration-300 ${
                  current > stepNum ? "bg-[#1D9E75]" : "bg-[#E8D8CE]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial seller type from URL query parameter
  const typeParam = searchParams.get("type") as SellerType;
  const initialType = (typeParam === "direct" || typeParam === "website") ? typeParam : null;

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    sellerType: initialType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo / GST upload mock triggers
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGst, setUploadingGst] = useState(false);

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "gstUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "logoUrl") setUploadingLogo(true);
    else setUploadingGst(true);

    // Mock direct upload path
    setTimeout(() => {
      if (field === "logoUrl") {
        update("logoUrl", "https://images.unsplash.com/photo-1516876437184-593fda40c7cd?q=80&w=150&auto=format&fit=crop");
        setUploadingLogo(false);
      } else {
        update("gstUrl", "https://example.com/mock-doc.pdf");
        setUploadingGst(false);
      }
    }, 1000);
  };

  const handleNext = () => {
    setError(null);

    if (step === 1 && !form.sellerType) {
      setError("Please select your business structure structure model.");
      return;
    }

    if (step === 2) {
      if (!form.businessName || !form.ownerName || !form.businessPhone || !form.businessEmail || !form.addressLine1 || !form.city || !form.pincode) {
        setError("Please populate all mandatory operational metrics.");
        return;
      }
      if (form.sellerType === "website" && !form.websiteUrl) {
        setError("Please enter your online storefront URL.");
        return;
      }
    }

    setStep((prev) => (prev + 1) as Step);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.accountName || !form.accountEmail || !form.password || !form.confirmPassword) {
      setError("Credentials fields cannot be left empty.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Confirmed password must match original entry.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStep(4);
      } else {
        const data = await res.json();
        setError(data.error?.message || "Onboarding failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not complete seller setup.");
    } finally {
      setLoading(false);
    }
  };

  // Reusable styling tokens
  const labelCls = "block text-[10px] font-semibold uppercase tracking-wider text-smoke mb-1.5";
  const inputCls = "block w-full px-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A] transition-all";

  return (
    <div className="w-full max-w-3xl bg-ivory rounded-xl border border-[#E8D8CE] p-8 sm:p-10 shadow-luxury-light text-charcoal">
      
      {/* Step Progress indicators */}
      <StepIndicator current={step} total={4} />

      {error && (
        <div className="mb-6 p-3 text-xs text-[#8B3A52] bg-[#F0E0D4] border border-[#8B3A52]/20 rounded">
          {error}
        </div>
      )}

      {/* ─── Step 1: Business Type Selection ─── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-charcoal">Select Business Type</h2>
            <p className="text-xs text-smoke font-light mt-1.5">Configure your integration type with Andromeda</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {/* Direct Seller */}
            <button
              type="button"
              onClick={() => update("sellerType", "direct")}
              className={`p-6 rounded border text-left transition-all duration-300 ${
                form.sellerType === "direct"
                  ? "border-2 border-[#8B3A52] bg-[#FDF0EB] shadow-luxury-light"
                  : "border-[#E8D8CE] hover:border-[#C07840] bg-[#FAF6F2]"
              }`}
            >
              <div className="h-10 w-10 rounded bg-white flex items-center justify-center border border-[#E8D8CE] mb-4">
                <Store className="h-5 w-5 text-[#8B3A52]" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">Type A — Direct Seller</h3>
              <p className="text-[10px] text-smoke mt-2 font-light leading-relaxed">
                List products directly on Andromeda. Handle incoming customer inquiries, inventory, and order dispatch natively. No website required.
              </p>
            </button>

            {/* Redirect Seller */}
            <button
              type="button"
              onClick={() => update("sellerType", "website")}
              className={`p-6 rounded border text-left transition-all duration-300 ${
                form.sellerType === "website"
                  ? "border-2 border-[#8B3A52] bg-[#FDF0EB] shadow-luxury-light"
                  : "border-[#E8D8CE] hover:border-[#C07840] bg-[#FAF6F2]"
              }`}
            >
              <div className="h-10 w-10 rounded bg-white flex items-center justify-center border border-[#E8D8CE] mb-4">
                <Globe className="h-5 w-5 text-[#8B3A52]" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">Type B — Redirect Seller</h3>
              <p className="text-[10px] text-smoke mt-2 font-light leading-relaxed">
                Link products from your existing domain storefront. Shoppers find you on Andromeda and transfer to your platform to checkout.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Business details ─── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E8D8CE] pb-3 mb-2">
            <Building className="h-4.5 w-4.5 text-rose" />
            <h2 className="text-xs font-semibold uppercase tracking-[2px] text-charcoal">Atelier Credentials</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Registered Business Name *</label>
                <input type="text" placeholder="Atelier name" value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Owner / Legal Representative *</label>
                <input type="text" placeholder="Full name" value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Phone *</label>
                <input type="tel" placeholder="10-digit number" value={form.businessPhone}
                  onChange={(e) => update("businessPhone", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Business Email *</label>
                <input type="email" placeholder="contact@atelier.com" value={form.businessEmail}
                  onChange={(e) => update("businessEmail", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Physical Address *</label>
              <input type="text" placeholder="Unit, building, street address" value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)} className={inputCls} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City *</label>
                <input type="text" placeholder="Bengaluru" value={form.city}
                  onChange={(e) => update("city", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State *</label>
                <select value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls}>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Pincode *</label>
                <input type="text" placeholder="6 digits" value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Logo and documents uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className={labelCls}>Atelier Logo</label>
                <div className="flex items-center gap-3 bg-[#FAF6F2] border border-dashed border-[#E8D8CE] hover:border-[#C4607A] rounded p-3 transition-colors">
                  <div className="h-10 w-10 rounded bg-white border border-[#E8D8CE] flex items-center justify-center overflow-hidden shrink-0">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <Store className="h-5 w-5 text-smoke" />
                    )}
                  </div>
                  <label className="flex-grow cursor-pointer text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B3A52]">
                      {uploadingLogo ? "Uploading..." : form.logoUrl ? "Replace File" : "Choose File"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logoUrl")} />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Business GST certificate</label>
                <div className="flex items-center gap-3 bg-[#FAF6F2] border border-dashed border-[#E8D8CE] hover:border-[#C4607A] rounded p-3 transition-colors">
                  <div className="h-10 w-10 rounded bg-white border border-[#E8D8CE] flex items-center justify-center overflow-hidden shrink-0">
                    {form.gstUrl ? (
                      <CheckCircle2 className="h-5 w-5 text-[#1D9E75]" />
                    ) : (
                      <FileText className="h-5 w-5 text-smoke" />
                    )}
                  </div>
                  <label className="flex-grow cursor-pointer text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B3A52]">
                      {uploadingGst ? "Uploading..." : form.gstUrl ? "Replace Doc" : "Choose PDF"}
                    </span>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => handleFileUpload(e, "gstUrl")} />
                  </label>
                </div>
              </div>
            </div>

            {/* Type B: URL input */}
            {form.sellerType === "website" && (
              <div className="rounded border border-[#8B3A52]/20 bg-[#FDF0EB] p-4 mt-3">
                <label className={`${labelCls} text-[#8B3A52]`}>Direct Storefront Website URL *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 h-4 w-4 text-[#8B3A52]" />
                  <input type="url" placeholder="https://yourdomain.com" value={form.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                    className={`${inputCls} pl-9 border-[#8B3A52]/30 focus:border-[#8B3A52]`} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 3: Account credentials ─── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E8D8CE] pb-3 mb-2">
            <Lock className="h-4.5 w-4.5 text-rose" />
            <h2 className="text-xs font-semibold uppercase tracking-[2px] text-charcoal">Account Credentials</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Administrator Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                <input type="text" placeholder="User name" value={form.accountName}
                  onChange={(e) => update("accountName", e.target.value)} className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Login Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                <input type="email" placeholder="email@domain.com" value={form.accountEmail}
                  onChange={(e) => update("accountEmail", e.target.value)} className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                <input type="password" placeholder="Min 8 characters" value={form.password}
                  onChange={(e) => update("password", e.target.value)} className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                <input type="password" placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)} className={`${inputCls} pl-9`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 4: Verification Success page ─── */}
      {step === 4 && (
        <div className="text-center py-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#C07840] bg-[#FDF0EB] text-[#C07840] mx-auto mb-6"
          >
            <Rocket className="h-10 w-10 animate-pulse" />
          </motion.div>

          <div className="flex items-center justify-center gap-1.5 text-center justify-center mb-2">
            <Sparkles className="h-4.5 w-4.5 text-[#C07840]" />
            <h2 className="text-2xl font-semibold text-charcoal">Registration Submitted!</h2>
          </div>

          <p className="text-xs text-smoke font-light max-w-md mx-auto mb-8 leading-relaxed">
            Welcome to Andromeda Atelier Network! Your application for <strong>{form.businessName}</strong> is pending review. Approval confirmation logs will dispatch to {form.accountEmail} within 24-48 hours.
          </p>

          <div className="flex justify-center gap-4">
            <Link 
              href="/login" 
              className="rounded bg-[#8B3A52] hover:bg-[#C4607A] text-[#FAF6F2] px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              Go to Seller Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step !== 4 && (
        <div className={`mt-10 pt-5 border-t border-[#E8D8CE]/40 flex ${step > 1 ? "justify-between" : "justify-end"}`}>
          {step > 1 && (
            <button
              onClick={() => { setError(null); setStep((prev) => (prev - 1) as Step); }}
              className="inline-flex items-center gap-1.5 rounded border border-[#E8D8CE] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-smoke hover:bg-[#FAF6F2] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded bg-[#8B3A52] hover:bg-[#C4607A] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="h-4.5 w-4.5" />
              )}
              Complete Setup
            </button>
          )}
        </div>
      )}

    </div>
  );
}

export default function SellerRegisterPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-full bg-[#FAF6F2] py-8 px-4">
      <Suspense fallback={
        <div className="animate-pulse flex flex-col items-center gap-4 py-16 w-full max-w-2xl px-4 bg-white border border-[#E8D8CE] rounded-xl">
          <div className="h-8 w-48 bg-zinc-200 rounded" />
          <div className="h-4 w-32 bg-zinc-200 rounded" />
          <div className="h-64 w-full bg-zinc-200 rounded" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
