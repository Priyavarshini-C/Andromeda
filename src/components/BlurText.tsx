// =============================================================================
// Andromeda — BlurText Scroll Reveal Component
// Splits text by spaces and performs an offset blur reveal on scroll entry.
// =============================================================================

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
}

export default function BlurText({ text, className = "" }: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const words = text.split(" ");

  return (
    <div
      ref={ref}
      className={`flex flex-wrap justify-center gap-y-[0.1em] ${className}`}
      style={{ rowGap: "0.1em" }}
    >
      {words.map((word, i) => {
        // Detect if word is wrapped in * for italic Instrument Serif formatting
        const isItalic = word.startsWith("*") && word.endsWith("*");
        const cleanWord = isItalic ? word.slice(1, -1) : word;

        return (
          <motion.span
            key={i}
            initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
            animate={
              isInView
                ? {
                    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                    opacity: [0, 0.5, 1],
                    y: [50, -5, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.7,
              times: [0, 0.5, 1],
              delay: i * 0.08,
              ease: "easeOut",
            }}
            className="inline-block mr-[0.28em]"
            style={{ marginRight: "0.28em" }}
          >
            {isItalic ? (
              <span className="font-serif italic font-normal text-ivory">
                {cleanWord}
              </span>
            ) : (
              cleanWord
            )}
          </motion.span>
        );
      })}
    </div>
  );
}
