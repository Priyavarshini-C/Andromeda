// =============================================================================
// Andromeda — FadingVideo Component
// High-fidelity, requestAnimationFrame-driven seamless fading video loop.
// =============================================================================

"use client";

import { useEffect, useRef } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
}

export default function FadingVideo({ src, className = "" }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const opacityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isFadingOutRef = useRef(false);

  const FADE_MS = 500;
  const FADE_OUT_LEAD = 0.55;

  const fadeTo = (targetOpacity: number) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const startOpacity = opacityRef.current;
    const duration = FADE_MS;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = startOpacity + (targetOpacity - startOpacity) * progress;
      opacityRef.current = current;
      
      if (videoRef.current) {
        videoRef.current.style.opacity = current.toString();
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = "0";

    const handleLoadedData = () => {
      video.play().catch(() => {});
      fadeTo(1);
    };

    const handleTimeUpdate = () => {
      if (video.duration && !isFadingOutRef.current) {
        const remaining = video.duration - video.currentTime;
        if (remaining <= FADE_OUT_LEAD) {
          isFadingOutRef.current = true;
          fadeTo(0);
        }
      }
    };

    const handleEnded = () => {
      opacityRef.current = 0;
      video.style.opacity = "0";
      isFadingOutRef.current = false;
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {});
          fadeTo(1);
        }
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // If already loaded/playing
    if (video.readyState >= 3) {
      video.play().catch(() => {});
      fadeTo(1);
    }

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity: 0 }}
    />
  );
}
