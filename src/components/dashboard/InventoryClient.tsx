// =============================================================================
// Andromeda — Price & Inventory Client Component
// =============================================================================

"use client";

import { useState, useTransition } from "react";
import {
  DollarSign,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { updateProductPriceStock } from "@/lib/actions/seller";
import { useRouter } from "next/navigation";

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: string;
  brand: string | null;
  categoryName: string;
}

interface Props {
  products: ProductRow[];
}

export default function InventoryClient({ products }: Props) {
  const [edits, setEdits] = useState<
    Record<string, { price?: string; originalPrice?: string; stock?: string }>
  >({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const getEditValue = (id: string, field: "price" | "originalPrice" | "stock") => {
    return edits[id]?.[field];
  };

  const setEditValue = (id: string, field: string, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSave = (product: ProductRow) => {
    const edit = edits[product.id];
    if (!edit) return;

    const values: { price?: number; originalPrice?: number; stock?: number } = {};
    if (edit.price !== undefined) values.price = Number(edit.price);
    if (edit.originalPrice !== undefined) values.originalPrice = Number(edit.originalPrice);
    if (edit.stock !== undefined) values.stock = Number(edit.stock);

    if (Object.keys(values).length === 0) return;

    startTransition(async () => {
      const result = await updateProductPriceStock(product.id, values);
      if (result.success) {
        setSavedIds((prev) => new Set(prev).add(product.id));
        setEdits((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
        setTimeout(() => {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
        }, 2000);
        router.refresh();
      }
    });
  };

  const activeProducts = products.filter((p) => p.status !== "removed");
  const lowStockProducts = activeProducts.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = activeProducts.filter((p) => p.stock === 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-tertiary to-tertiary/70 text-white">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">Price & Inventory</h1>
          <p className="text-xs text-on-surface-variant">
            Update prices and stock levels in real-time.
          </p>
        </div>
      </div>

      {/* Alerts Summary */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {outOfStockProducts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20">
              <AlertTriangle className="h-3.5 w-3.5 text-error" />
              <span className="text-[11px] font-bold text-error">
                {outOfStockProducts.length} out of stock
              </span>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tertiary/10 border border-tertiary/20">
              <AlertTriangle className="h-3.5 w-3.5 text-tertiary" />
              <span className="text-[11px] font-bold text-tertiary">
                {lowStockProducts.length} low stock (≤ 5)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-card overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1fr_120px_120px_100px_80px] gap-3 px-5 py-3 bg-surface-container/50 border-b border-outline-variant/20">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Product
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Price (₹)
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            MRP (₹)
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Stock
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">
            Action
          </span>
        </div>

        {activeProducts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package className="h-10 w-10 text-outline-variant mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">No products to manage.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {activeProducts.map((product) => {
              const hasEdits = !!edits[product.id];
              const isSaved = savedIds.has(product.id);
              const isLow = product.stock > 0 && product.stock <= 5;
              const isOut = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className={`grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_100px_80px] gap-2 sm:gap-3 px-5 py-3 items-center hover:bg-surface-container/20 transition-colors ${
                    isOut ? "bg-error/[0.02]" : isLow ? "bg-tertiary/[0.02]" : ""
                  }`}
                >
                  {/* Product Info */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-on-surface-variant">
                        {product.categoryName}
                      </span>
                      {product.brand && (
                        <span className="text-[10px] text-outline">· {product.brand}</span>
                      )}
                      {isOut && (
                        <span className="text-[9px] font-bold text-error bg-error/10 px-1.5 py-0.5 rounded">
                          OUT OF STOCK
                        </span>
                      )}
                      {isLow && !isOut && (
                        <span className="text-[9px] font-bold text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">
                          LOW STOCK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Input */}
                  <div>
                    <label className="sm:hidden text-[10px] text-on-surface-variant font-semibold">Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={getEditValue(product.id, "price") ?? product.price}
                      onChange={(e) => setEditValue(product.id, "price", e.target.value)}
                      className="w-full rounded-md border border-outline-variant/40 bg-surface px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                    />
                  </div>

                  {/* Original Price Input */}
                  <div>
                    <label className="sm:hidden text-[10px] text-on-surface-variant font-semibold">MRP</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        getEditValue(product.id, "originalPrice") ??
                        (product.originalPrice || "")
                      }
                      onChange={(e) =>
                        setEditValue(product.id, "originalPrice", e.target.value)
                      }
                      placeholder="—"
                      className="w-full rounded-md border border-outline-variant/40 bg-surface px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                    />
                  </div>

                  {/* Stock Input */}
                  <div>
                    <label className="sm:hidden text-[10px] text-on-surface-variant font-semibold">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={getEditValue(product.id, "stock") ?? product.stock}
                      onChange={(e) => setEditValue(product.id, "stock", e.target.value)}
                      className={`w-full rounded-md border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary/30 ${
                        isOut
                          ? "border-error/40 bg-error/5 text-error"
                          : isLow
                          ? "border-tertiary/40 bg-tertiary/5 text-tertiary"
                          : "border-outline-variant/40 bg-surface text-on-surface"
                      }`}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    {isSaved ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-success">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSave(product)}
                        disabled={!hasEdits || isPending}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${
                          hasEdits
                            ? "bg-primary text-white hover:bg-primary-container"
                            : "bg-surface-container text-outline"
                        }`}
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
