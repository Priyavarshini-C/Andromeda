"use client";

import { useState } from "react";
import { AIAssistantModal } from "@/components/AIAssistantModal";

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        id="ai-assistant-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Shopping Assistant"
        style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "1.5rem",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.5)",
          zIndex: 8000,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 12px 40px rgba(139, 92, 246, 0.7)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 8px 32px rgba(139, 92, 246, 0.5)";
        }}
      >
        🤖
      </button>

      <AIAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
