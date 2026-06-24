"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Markdown renderer (basic)
// ---------------------------------------------------------------------------
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#a78bfa;text-decoration:underline">$1</a>')
    .replace(/^- /gm, "• ")
    .replace(/\n/g, "<br/>");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Quick prompt suggestions
// ---------------------------------------------------------------------------
const SUGGESTIONS = [
  "Find wireless earphones under ₹2000",
  "Best rated laptops",
  "Show me budget smartphones",
  "Compare products",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "Hey there! 👋 I'm Andromeda's AI shopping assistant. I can help you find products, compare prices, and discover the best deals. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text || input).trim();
      if (!content || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, history }),
        });

        const data = await res.json();
        const reply =
          data.reply ?? "Sorry, I encountered an issue. Please try again.";

        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "⚠️ Something went wrong. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .ai-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(6px);
          z-index: 9000;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 1.5rem;
        }
        .ai-modal {
          background: #13131f;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.06);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .ai-header {
          background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1));
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .ai-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .ai-header-info { flex: 1; }
        .ai-header-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: #f1f5f9;
        }
        .ai-header-status {
          font-size: 0.75rem;
          color: #4ade80;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: blink 1.5s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .ai-close-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          color: #94a3b8;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .ai-close-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #f1f5f9;
        }
        .ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(139,92,246,0.3) transparent;
        }
        .ai-bubble {
          max-width: 85%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          font-size: 0.875rem;
          line-height: 1.6;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ai-bubble.user {
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .ai-bubble.assistant {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e8f0;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .ai-typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          width: 60px;
          align-self: flex-start;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: bounce 1.2s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .ai-suggestions {
          padding: 0.5rem 1rem;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
          flex-shrink: 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ai-suggestions::-webkit-scrollbar { display: none; }
        .suggestion-chip {
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.25);
          color: #a78bfa;
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          white-space: nowrap;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .suggestion-chip:hover {
          background: rgba(139,92,246,0.25);
        }
        .ai-input-area {
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .ai-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.6rem 1rem;
          color: #f1f5f9;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .ai-input:focus {
          border-color: rgba(139,92,246,0.5);
        }
        .ai-input::placeholder { color: #64748b; }
        .ai-send-btn {
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          border: none;
          color: #fff;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ai-send-btn:hover:not(:disabled) { opacity: 0.85; }
      `}</style>

      <div className="ai-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="ai-modal">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-avatar">🤖</div>
            <div className="ai-header-info">
              <div className="ai-header-name">Andromeda Assistant</div>
              <div className="ai-header-status">
                <div className="status-dot" />
                Online — ready to help
              </div>
            </div>
            <button className="ai-close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-bubble ${msg.role}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            ))}
            {loading && (
              <div className="ai-typing">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="ai-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="suggestion-chip"
                onClick={() => sendMessage(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="ai-input-area">
            <input
              ref={inputRef}
              className="ai-input"
              placeholder="Ask me about products..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              className="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
