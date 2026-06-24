// =============================================================================
// Andromeda — Dashboard Overview Client Component
// =============================================================================

"use client";

import Link from "next/link";
import {
  Package,
  TrendingUp,
  Star,
  AlertTriangle,
  DollarSign,
  BoxSelect,
  MessageSquare,
  ChevronRight,
  BarChart3,
} from "lucide-react";

interface Props {
  seller: {
    businessName: string;
    rating: number;
    isVerified: boolean;
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    totalStock: number;
    avgPrice: number;
    lowStock: number;
    outOfStock: number;
    totalReviews: number;
    avgRating: number;
  };
  recentProducts: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    status: string;
    rating: number;
    reviewCount: number;
  }>;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-card p-5 hover:shadow-observatory transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-primary">{value}</p>
          {subtext && (
            <p className="mt-0.5 text-[11px] text-on-surface-variant">{subtext}</p>
          )}
        </div>
        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverviewClient({ seller, stats, recentProducts }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Welcome back, {seller.businessName}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Here's a snapshot of your store's performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-secondary"
          subtext={`${stats.activeProducts} active, ${stats.draftProducts} draft`}
        />
        <StatCard
          label="Total Stock"
          value={stats.totalStock.toLocaleString()}
          icon={BoxSelect}
          color="bg-primary"
          subtext={stats.lowStock > 0 ? `${stats.lowStock} low stock` : "All stocked"}
        />
        <StatCard
          label="Avg. Price"
          value={`₹${stats.avgPrice.toLocaleString()}`}
          icon={DollarSign}
          color="bg-tertiary"
        />
        <StatCard
          label="Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
          color="bg-success"
          subtext={`${stats.avgRating}★ avg. rating`}
        />
      </div>

      {/* Alerts */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="mb-8 rounded-xl border border-tertiary/20 bg-tertiary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-tertiary" />
            <h3 className="text-xs font-bold text-primary">Inventory Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {stats.outOfStock > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-error/10 text-[10px] font-bold text-error">
                  {stats.outOfStock}
                </span>
                <span className="text-xs text-on-surface-variant">out of stock</span>
              </div>
            )}
            {stats.lowStock > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-tertiary/10 text-[10px] font-bold text-tertiary">
                  {stats.lowStock}
                </span>
                <span className="text-xs text-on-surface-variant">low stock (≤ 5 units)</span>
              </div>
            )}
          </div>
          <Link
            href="/dashboard/inventory"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary hover:text-tertiary/80 transition-colors"
          >
            Manage Inventory <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Recent Products */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/15 flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-secondary" />
            Recent Products
          </h2>
          <Link
            href="/dashboard/products"
            className="text-[11px] font-bold text-secondary hover:text-secondary/80 transition-colors flex items-center gap-0.5"
          >
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Package className="h-10 w-10 text-outline-variant mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">No products yet.</p>
            <Link
              href="/dashboard/products"
              className="mt-2 inline-flex text-xs font-bold text-secondary hover:text-secondary/80"
            >
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="px-5 py-3 flex items-center gap-4 hover:bg-surface-container/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-primary truncate">{product.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] font-semibold text-on-surface">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Stock: {product.stock}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-tertiary fill-tertiary" />
                      <span className="text-[11px] text-on-surface-variant">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.status === "active"
                      ? "bg-success/10 text-success"
                      : "bg-outline-variant/20 text-on-surface-variant"
                  }`}
                >
                  {product.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
