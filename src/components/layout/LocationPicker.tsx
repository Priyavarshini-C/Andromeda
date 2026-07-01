// =============================================================================
// Andromeda — Location Picker (Navbar dropdown for pincode/geolocation)
// =============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, X, ChevronDown, Loader2 } from "lucide-react";
import { useLocationStore } from "@/store/location.store";

export default function LocationPicker() {
  const {
    city,
    pincode,
    isDetecting,
    detectLocation,
    setPincode,
    clearLocation,
  } = useLocationStore();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDetect = async () => {
    setError("");
    await detectLocation();
    // Check if permission was denied after attempt
    const state = useLocationStore.getState();
    if (state.hasPermission === false) {
      setError("Location access denied. Enter pincode instead.");
    } else if (state.city) {
      setOpen(false);
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = pincodeInput.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setPincode(trimmed);
    setPincodeInput("");
    setOpen(false);
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-300 opacity-50">
        <MapPin className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Location</span>
      </div>
    );
  }

  const displayLabel = city || (pincode ? `PIN ${pincode}` : null);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer group"
        title="Set your location"
      >
        <MapPin className="h-3.5 w-3.5 text-tertiary group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline max-w-[100px] truncate">
          {displayLabel || "Set location"}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-surface-card text-on-surface shadow-observatory-lifted border border-outline-variant/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-surface-container/50 border-b border-outline-variant/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-tertiary" />
                Your Location
              </h3>
              {displayLabel && (
                <button
                  onClick={() => { clearLocation(); setOpen(false); }}
                  className="text-[10px] text-on-surface-variant hover:text-error transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
            {displayLabel && (
              <p className="mt-1 text-[11px] text-on-surface-variant">
                Currently: <span className="font-semibold text-secondary">{displayLabel}</span>
                {pincode && city && <span className="ml-1 text-outline">({pincode})</span>}
              </p>
            )}
          </div>

          {/* Auto-detect */}
          <div className="px-4 py-3">
            <button
              onClick={handleDetect}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Navigation className="h-3.5 w-3.5" />
                  Detect My Location
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="px-4 flex items-center gap-2">
            <div className="flex-1 border-t border-outline-variant/30" />
            <span className="text-[10px] text-outline font-medium">OR</span>
            <div className="flex-1 border-t border-outline-variant/30" />
          </div>

          {/* Manual Pincode */}
          <form onSubmit={handlePincodeSubmit} className="px-4 py-3">
            <label className="text-[11px] font-semibold text-on-surface-variant mb-1.5 block">
              Enter Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 560001"
                value={pincodeInput}
                onChange={(e) => {
                  setPincodeInput(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className="flex-1 rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="px-4 pb-3">
              <p className="text-[10px] text-error font-medium">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
