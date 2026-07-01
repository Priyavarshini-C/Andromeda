"use client";

import { useState, useTransition } from "react";
import {
  approveSeller,
  rejectSeller,
  suspendSeller,
  toggleUserActive,
  broadcastNotification,
} from "@/lib/actions/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  pendingSellers: number;
  totalRevenue: number;
  newUsersLast30Days: number;
}

export interface Seller {
  id: string;
  businessName: string;
  slug: string;
  city?: string | null;
  state?: string | null;
  status: string;
  isVerified: boolean;
  rating: number;
  productCount: number;
  email?: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  userName?: string | null;
  userEmail?: string | null;
  sellerName?: string | null;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface Props {
  stats: AdminStats | null;
  sellers: Seller[];
  recentOrders: Order[];
  recentUsers: User[];
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  pending: "#f59e0b",
  suspended: "#ef4444",
  rejected: "#94a3b8",
  confirmed: "#22d3ee",
  shipped: "#6366f1",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  paid: "#22c55e",
  failed: "#ef4444",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        background: `${STATUS_COLORS[status] ?? "#94a3b8"}22`,
        color: STATUS_COLORS[status] ?? "#94a3b8",
        border: `1px solid ${STATUS_COLORS[status] ?? "#94a3b8"}44`,
        padding: "0.2rem 0.6rem",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${accent}33`,
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          fontSize: "1.75rem",
          background: `${accent}22`,
          width: 48,
          height: 48,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f1f5f9" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function AdminDashboardClient({ stats, sellers, recentOrders, recentUsers }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "sellers" | "orders" | "users" | "broadcast">("overview");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [localSellers, setLocalSellers] = useState(sellers);
  const [localUsers, setLocalUsers] = useState(recentUsers);

  const handleApprove = (sellerId: string) => {
    startTransition(async () => {
      await approveSeller(sellerId);
      setLocalSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: "active", isVerified: true } : s))
      );
    });
  };

  const handleReject = (sellerId: string) => {
    startTransition(async () => {
      await rejectSeller(sellerId);
      setLocalSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: "rejected" } : s))
      );
    });
  };

  const handleSuspend = (sellerId: string) => {
    startTransition(async () => {
      await suspendSeller(sellerId);
      setLocalSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: "suspended" } : s))
      );
    });
  };

  const handleToggleUser = (userId: string) => {
    startTransition(async () => {
      await toggleUserActive(userId);
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    });
  };

  const handleBroadcast = () => {
    if (!broadcastTitle || !broadcastMessage) return;
    startTransition(async () => {
      const result = await broadcastNotification(broadcastTitle, broadcastMessage);
      if ("success" in result && result.success && "sentTo" in result) {
        setBroadcastStatus(`✅ Sent to ${result.sentTo} users!`);
        setBroadcastTitle("");
        setBroadcastMessage("");
      } else {
        setBroadcastStatus("❌ Failed to send. Try again.");
      }
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d1a",
        color: "#f1f5f9",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              borderRadius: "14px",
              width: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ⚙️
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
              Admin Console
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              Andromeda Platform Management
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "14px",
            padding: "0.4rem",
            width: "fit-content",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              { key: "overview", label: "📊 Overview" },
              { key: "sellers", label: "🏪 Sellers" },
              { key: "orders", label: "📦 Orders" },
              { key: "users", label: "👤 Users" },
              { key: "broadcast", label: "📢 Broadcast" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background:
                  activeTab === tab.key
                    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                    : "transparent",
                border: "none",
                color: activeTab === tab.key ? "#fff" : "#94a3b8",
                padding: "0.5rem 1.25rem",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && stats && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon="👤" accent="#8b5cf6" />
              <StatCard label="Total Sellers" value={stats.totalSellers.toLocaleString()} icon="🏪" accent="#06b6d4" />
              <StatCard label="Total Products" value={stats.totalProducts.toLocaleString()} icon="📦" accent="#22c55e" />
              <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} icon="🛒" accent="#f59e0b" />
              <StatCard
                label="Platform Revenue"
                value={`₹${stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                icon="💰"
                accent="#ec4899"
              />
              <StatCard label="Pending Approvals" value={stats.pendingSellers} icon="⏳" accent="#f59e0b" />
              <StatCard label="New Users (30d)" value={stats.newUsersLast30Days} icon="📈" accent="#4ade80" />
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === "sellers" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              Seller Applications & Management
            </h2>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Business", "Location", "Status", "Products", "Rating", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {localSellers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                        No sellers found
                      </td>
                    </tr>
                  ) : (
                    localSellers.map((seller) => (
                      <tr
                        key={seller.id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 600 }}>{seller.businessName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {seller.email ?? "—"}
                          </div>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                          {seller.city && seller.state
                            ? `${seller.city}, ${seller.state}`
                            : "—"}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <StatusBadge status={seller.status} />
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.85rem" }}>
                          {seller.productCount}
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.85rem" }}>
                          ⭐ {seller.rating.toFixed(1)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {seller.status === "pending" && (
                              <>
                                <ActionBtn
                                  onClick={() => handleApprove(seller.id)}
                                  color="#22c55e"
                                  disabled={isPending}
                                >
                                  Approve
                                </ActionBtn>
                                <ActionBtn
                                  onClick={() => handleReject(seller.id)}
                                  color="#ef4444"
                                  disabled={isPending}
                                >
                                  Reject
                                </ActionBtn>
                              </>
                            )}
                            {seller.status === "active" && (
                              <ActionBtn
                                onClick={() => handleSuspend(seller.id)}
                                color="#f59e0b"
                                disabled={isPending}
                              >
                                Suspend
                              </ActionBtn>
                            )}
                            {seller.status === "suspended" && (
                              <ActionBtn
                                onClick={() => handleApprove(seller.id)}
                                color="#22c55e"
                                disabled={isPending}
                              >
                                Reinstate
                              </ActionBtn>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              Recent Orders
            </h2>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Order ID", "Customer", "Seller", "Amount", "Status", "Payment", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td style={{ padding: "1rem", fontSize: "0.8rem", fontFamily: "monospace", color: "#94a3b8" }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontSize: "0.875rem" }}>{order.userName ?? "—"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{order.userEmail ?? ""}</div>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                          {order.sellerName ?? "—"}
                        </td>
                        <td style={{ padding: "1rem", fontWeight: 600 }}>
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <StatusBadge status={order.paymentStatus} />
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#64748b" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              User Management
            </h2>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {localUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    localUsers.map((user) => (
                      <tr
                        key={user.id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td style={{ padding: "1rem", fontWeight: 600 }}>
                          {user.name ?? "Anonymous"}
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#94a3b8" }}>
                          {user.email ?? "—"}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <StatusBadge status={user.role} />
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <StatusBadge status={user.isActive ? "active" : "suspended"} />
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#64748b" }}>
                          {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <ActionBtn
                            onClick={() => handleToggleUser(user.id)}
                            color={user.isActive ? "#ef4444" : "#22c55e"}
                            disabled={isPending}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </ActionBtn>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === "broadcast" && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              📢 Broadcast Notification
            </h2>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div>
                <label style={{ fontSize: "0.875rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
                  Title
                </label>
                <input
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. 🎉 Big Sale Today!"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#f1f5f9",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.875rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
                  Message
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type your announcement here..."
                  rows={5}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#f1f5f9",
                    fontSize: "0.95rem",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {broadcastStatus && (
                <div
                  style={{
                    background: broadcastStatus.startsWith("✅")
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    border: `1px solid ${broadcastStatus.startsWith("✅") ? "#22c55e" : "#ef4444"}44`,
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.875rem",
                    color: broadcastStatus.startsWith("✅") ? "#22c55e" : "#ef4444",
                  }}
                >
                  {broadcastStatus}
                </div>
              )}
              <button
                onClick={handleBroadcast}
                disabled={isPending || !broadcastTitle || !broadcastMessage}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  border: "none",
                  color: "#fff",
                  padding: "0.875rem",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: isPending || !broadcastTitle || !broadcastMessage ? 0.5 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {isPending ? "Sending..." : "📢 Send to All Users"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared ActionBtn
// ---------------------------------------------------------------------------
function ActionBtn({
  onClick,
  color,
  disabled,
  children,
}: {
  onClick: () => void;
  color: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
        padding: "0.3rem 0.75rem",
        borderRadius: "8px",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
