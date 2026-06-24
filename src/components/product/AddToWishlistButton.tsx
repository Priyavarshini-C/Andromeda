// =============================================================================
// Andromeda — Add to Wishlist Button (Client Component)
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export default function AddToWishlistButton({ productId, className = "", size = "md" }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Check on mount if already wishlisted
  useEffect(() => {
    if (status !== "authenticated") return;
    const check = async () => {
      try {
        const res = await fetch("/api/user/wishlist");
        if (res.ok) {
          const data = await res.json();
          const items: any[] = data.data || [];
          setIsWishlisted(items.some((i: any) => i.product?.id === productId));
        }
      } catch { /* silent */ }
    };
    check();
  }, [productId, status]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleClick = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    if (loading) return;

    if (isWishlisted) {
      // Find and remove
      setLoading(true);
      try {
        const res = await fetch("/api/user/wishlist");
        if (res.ok) {
          const data = await res.json();
          const items: any[] = data.data || [];
          const match = items.find((i: any) => i.product?.id === productId);
          if (match) {
            await fetch(`/api/user/wishlist/${match.id}`, { method: "DELETE" });
            setIsWishlisted(false);
            showToast("Removed from wishlist");
          }
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok || res.status === 409) {
          setIsWishlisted(true);
          showToast("Added to wishlist!");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnSize = size === "sm" ? "p-1.5" : "p-2";

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={loading}
        title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        className={`relative flex items-center justify-center rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
          isWishlisted
            ? "border-error/30 bg-error/10 text-error hover:bg-error/20"
            : "border-outline-variant bg-surface-card text-on-surface-variant hover:border-error/30 hover:text-error hover:bg-error/5"
        } ${btnSize} ${className}`}
      >
        {loading ? (
          <span className={`${iconSize} border-2 border-current/30 border-t-current rounded-full animate-spin block`} />
        ) : (
          <Heart className={`${iconSize} ${isWishlisted ? "fill-current" : ""} transition-all`} />
        )}
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-on-surface text-surface text-[11px] font-semibold px-3 py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
