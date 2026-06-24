"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  general: "🔔",
  order: "📦",
  price_drop: "🏷️",
  wishlist: "❤️",
};

const TYPE_COLORS: Record<string, string> = {
  general: "var(--accent-purple)",
  order: "#22d3ee",
  price_drop: "#f59e0b",
  wishlist: "#f43f5e",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const deleteNotification = async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  };

  const displayed =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="notifications-page">
      <style>{`
        .notifications-page {
          min-height: 100vh;
          background: var(--bg-primary, #0d0d1a);
          color: var(--text-primary, #f1f5f9);
          padding: 2rem 1rem;
          font-family: 'Inter', sans-serif;
        }
        .notif-container {
          max-width: 760px;
          margin: 0 auto;
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .notif-title {
          font-size: 1.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .notif-badge {
          background: var(--accent-purple, #8b5cf6);
          color: #fff;
          border-radius: 9999px;
          padding: 0.15rem 0.65rem;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .notif-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .notif-btn {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.35);
          color: #a78bfa;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .notif-btn:hover {
          background: rgba(139, 92, 246, 0.3);
        }
        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 0.35rem;
          width: fit-content;
        }
        .filter-tab {
          padding: 0.4rem 1.25rem;
          border-radius: 9px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--text-muted, #94a3b8);
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: var(--accent-purple, #8b5cf6);
          color: #fff;
        }
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .notif-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
        }
        .notif-item:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }
        .notif-item.unread {
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.06);
        }
        .notif-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.06);
        }
        .notif-content {
          flex: 1;
          min-width: 0;
        }
        .notif-item-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.35rem;
        }
        .notif-message {
          font-size: 0.85rem;
          color: var(--text-muted, #94a3b8);
          line-height: 1.5;
        }
        .notif-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .notif-time {
          font-size: 0.75rem;
          color: var(--text-muted, #94a3b8);
        }
        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-purple, #8b5cf6);
          flex-shrink: 0;
          margin-top: 6px;
        }
        .notif-del-btn {
          background: transparent;
          border: none;
          color: var(--text-muted, #94a3b8);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          font-size: 1rem;
          opacity: 0.5;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .notif-del-btn:hover {
          opacity: 1;
          color: #f43f5e;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted, #94a3b8);
        }
        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          display: block;
        }
        .empty-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary, #f1f5f9);
        }
        .skeleton {
          background: rgba(255,255,255,0.06);
          border-radius: 16px;
          height: 90px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="notif-container">
        <div className="notif-header">
          <h1 className="notif-title">
            Notifications
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </h1>
          <div className="notif-actions">
            {unreadCount > 0 && (
              <button className="notif-btn" onClick={markAllRead}>
                ✓ Mark all read
              </button>
            )}
            <button className="notif-btn" onClick={fetchNotifications}>
              ↺ Refresh
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`filter-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {loading ? (
          <div className="notif-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            <div className="empty-title">Something went wrong</div>
            <p>{error}</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <div className="empty-title">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
            <p>
              {filter === "unread"
                ? "You're all caught up!"
                : "We'll notify you about orders, price drops, and more."}
            </p>
          </div>
        ) : (
          <div className="notif-list">
            {displayed.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.isRead ? "unread" : ""}`}
                onClick={() => !notif.isRead && markRead(notif.id)}
              >
                {!notif.isRead && <div className="unread-dot" />}
                <div
                  className="notif-icon"
                  style={{
                    background: `${TYPE_COLORS[notif.type] ?? TYPE_COLORS.general}22`,
                  }}
                >
                  {TYPE_ICONS[notif.type] ?? "🔔"}
                </div>
                <div className="notif-content">
                  <div className="notif-item-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-meta">
                    <span className="notif-time">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  className="notif-del-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  title="Delete notification"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
