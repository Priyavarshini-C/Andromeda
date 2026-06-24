// =============================================================================
// Andromeda — Product Review Submission Form
// =============================================================================

"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/lib/actions/reviews";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

export default function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, data.url]);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isGuest = status !== "authenticated";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await submitReview({
        productId,
        rating,
        title,
        content,
        images: JSON.stringify(images),
      });

      if (result?.error === "ALREADY_EXISTS") {
        setError("You have already reviewed this product.");
      } else if (result?.error === "UNAUTHORIZED") {
        router.push("/login");
      } else if (result?.error) {
        setError("Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRatingInput = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-600"
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm font-bold text-amber-500">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
        </span>
      )}
    </div>
  );

  // If not logged in
  if (isGuest) {
    return (
      <div className="mt-8 border-t border-outline-variant/30 pt-6">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Write a Review
        </h3>
        <div className="flex items-center gap-4 p-5 rounded-xl border border-outline-variant bg-surface-container/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface">Sign in to write a review</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Share your experience to help other shoppers.</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-8 border-t border-outline-variant/30 pt-6">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Write a Review
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h4 className="text-base font-bold text-primary">Review Submitted!</h4>
          <p className="text-sm text-on-surface-variant max-w-xs">
            Thank you for sharing your experience. Your review helps other shoppers make better decisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-outline-variant/30 pt-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-4 group cursor-pointer"
      >
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Write a Review
        </h3>
        <span className={`text-xs font-semibold text-secondary transition-opacity ${collapsed ? "opacity-100" : "opacity-0"}`}>
          + Add Review
        </span>
      </button>

      {!collapsed && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error font-semibold">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">
              Your Rating <span className="text-error">*</span>
            </label>
            <StarRatingInput />
          </div>

          {/* Review Title (optional) */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
              Review Title <span className="text-on-surface-variant/50">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Summarize your experience in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
              Your Review <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you like or dislike? How was the quality, value, and delivery?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all resize-none"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">{content.length}/1000 characters</p>
          </div>

          {/* Review Photos */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">
              Add Photos <span className="text-on-surface-variant/50">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={img} className="relative h-14 w-14 rounded-lg bg-surface border border-outline-variant/30 overflow-hidden shrink-0 group">
                  <img src={img} alt="Review" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0.5 right-0.5 h-4 w-4 bg-black/75 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-colors text-[9px]"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <label className={`h-14 w-14 rounded-lg border border-dashed border-outline-variant/40 hover:border-secondary/50 hover:bg-secondary/5 flex flex-col items-center justify-center text-outline hover:text-secondary cursor-pointer transition-all ${uploadingImage ? "animate-pulse" : ""}`}>
                <span className="text-xs font-bold">{uploadingImage ? "..." : "+"}</span>
                <span className="text-[8px] font-bold uppercase mt-0.5">{uploadingImage ? "Load" : "Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCollapsed(true);
                setRating(0);
                setTitle("");
                setContent("");
                setImages([]);
                setError(null);
              }}
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-outline-variant hover:border-secondary/50 hover:bg-secondary/5 transition-all text-sm font-semibold text-on-surface-variant hover:text-secondary cursor-pointer"
        >
          <Star className="h-4 w-4" />
          Rate & Review This Product
        </button>
      )}
    </div>
  );
}
