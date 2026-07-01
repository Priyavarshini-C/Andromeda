// =============================================================================
// Andromeda — Premium Dashboard Overview Client Component (Rose Gold Overhaul)
// =============================================================================

"use client";

import Link from "next/link";
import {
  Package,
  Star,
  AlertTriangle,
  DollarSign,
  BoxSelect,
  MessageSquare,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

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
  accentColor,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  subtext?: string;
}) {
  return (
    <div 
      className="rounded-xl border border-[#E8D8CE] bg-ivory p-6 shadow-luxury-light hover:shadow-luxury-dark transition-all duration-300 relative overflow-hidden"
      style={{ borderTop: `4px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-smoke uppercase tracking-[2px] font-sans">
            {label}
          </p>
          <p className="mt-2 text-3xl font-serif italic font-normal text-charcoal">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-[11px] text-smoke font-light">{subtext}</p>
          )}
        </div>
        <div 
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-[#E8D8CE]"
          style={{ color: accentColor }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverviewClient({ seller, stats, recentProducts }: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-sans font-light tracking-[3px] uppercase text-smoke">
          Operational Center
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal mt-1">
          Welcome back, {seller.businessName}
        </h1>
        <p className="mt-1 text-sm text-smoke font-light">
          Here is a calibrated assessment of your store inventory and rating metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
          accentColor="#8B3A52" /* Rose */
          subtext={`${stats.activeProducts} active, ${stats.draftProducts} drafts`}
        />
        <StatCard
          label="Total Stock"
          value={stats.totalStock.toLocaleString()}
          icon={BoxSelect}
          accentColor="#1D9E75" /* Aurora Green */
          subtext={stats.lowStock > 0 ? `${stats.lowStock} low stock lines` : "All cataloged lines stocked"}
        />
        <StatCard
          label="Avg. Price"
          value={`₹${stats.avgPrice.toLocaleString("en-IN")}`}
          icon={DollarSign}
          accentColor="#C07840" /* Copper */
          subtext="Standard store average"
        />
        <StatCard
          label="Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
          accentColor="#1C1410" /* Charcoal */
          subtext={`${stats.avgRating.toFixed(1)}★ average score`}
        />
      </div>

      {/* Alerts */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="rounded-xl border border-[#C07840]/20 bg-[#FDF0EB] p-5 border-l-4 border-l-[#C07840] shadow-luxury-light">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4.5 w-4.5 text-[#C07840]" />
            <h3 className="text-xs font-semibold text-[#1C1410] uppercase tracking-wider">Inventory Warnings</h3>
          </div>
          <div className="flex flex-wrap gap-6 mt-1">
            {stats.outOfStock > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8B3A52]/10 text-[10px] font-bold text-[#8B3A52]">
                  {stats.outOfStock}
                </span>
                <span className="text-xs text-smoke font-light">depleted (out of stock)</span>
              </div>
            )}
            {stats.lowStock > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C07840]/10 text-[10px] font-bold text-[#C07840]">
                  {stats.lowStock}
                </span>
                <span className="text-xs text-smoke font-light">running low (≤ 5 units)</span>
              </div>
            )}
          </div>
          <Link
            href="/dashboard/inventory"
            className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#C4607A] hover:underline uppercase tracking-wider"
          >
            Calibrate Inventory <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Recent Products Grid */}
      <div className="rounded-xl border border-[#E8D8CE] bg-ivory overflow-hidden shadow-luxury-light">
        <div className="px-6 py-4.5 border-b border-[#E8D8CE] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-rose" />
            Recent Products Log
          </h2>
          <Link
            href="/dashboard/products"
            className="text-xs font-semibold text-[#C4607A] hover:underline flex items-center gap-0.5"
          >
            View All Listings <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="px-6 py-12 text-center text-smoke font-light">
            <Package className="h-10 w-10 text-[#E8D8CE] mx-auto mb-3" />
            <p className="text-sm">No products listed in your catalog yet.</p>
            <Link
              href="/dashboard/products"
              className="mt-3 inline-flex text-xs font-semibold text-[#C4607A] hover:underline uppercase tracking-wider"
            >
              Add first product →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E8D8CE]">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#FAF6F2] transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal truncate">{product.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-[11px] text-smoke font-light">
                    <span className="font-semibold text-charcoal">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <span>•</span>
                    <span>Stock: {product.stock}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-current text-goldmist" />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </span>
                  </div>
                </div>
                
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                    product.status === "active"
                      ? "bg-[#E1F5EE] text-[#085041]"
                      : "bg-[#F0E0D4] text-[#8B3A52]"
                  }`}
                >
                  {product.status === "active" ? "Published" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
