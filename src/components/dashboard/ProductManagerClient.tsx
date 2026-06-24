// =============================================================================
// Andromeda — Seller Product Manager Client Component
// =============================================================================

"use client";

import { useState, useTransition } from "react";
import {
  Package,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Star,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { addProduct, updateProductStatus, deleteProduct } from "@/lib/actions/seller";
import { useRouter } from "next/navigation";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: string;
  brand: string | null;
  rating: number;
  reviewCount: number;
  categoryName: string;
  categoryId: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  products: ProductItem[];
  categories: Category[];
}

export default function ProductManagerClient({ products, categories }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  // Add product form state
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id || "",
    price: "",
    originalPrice: "",
    stock: "",
    brand: "",
    specs: "{}",
    status: "active" as "draft" | "active",
    images: [] as string[],
  });

  const [uploadingImage, setUploadingImage] = useState(false);

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
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
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
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const filtered =
    statusFilter === "all"
      ? products
      : products.filter((p) => p.status === statusFilter);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await addProduct({
        title: newProduct.title,
        description: newProduct.description,
        categoryId: newProduct.categoryId,
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
        stock: Number(newProduct.stock),
        brand: newProduct.brand,
        specs: newProduct.specs,
        status: newProduct.status,
        images: JSON.stringify(newProduct.images),
        thumbnailUrl: newProduct.images[0] || undefined,
      });
      if (result.success) {
        setShowAddForm(false);
        setNewProduct({
          title: "", description: "", categoryId: categories[0]?.id || "",
          price: "", originalPrice: "", stock: "", brand: "", specs: "{}", status: "active",
          images: [],
        });
        router.refresh();
      }
    });
  };

  const handleStatusChange = (productId: string, status: "active" | "hidden" | "removed") => {
    startTransition(async () => {
      await updateProductStatus(productId, status);
      router.refresh();
    });
  };

  const handleDelete = (productId: string) => {
    if (!confirm("Delete this product permanently?")) return;
    startTransition(async () => {
      await deleteProduct(productId);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Products</h1>
            <p className="text-xs text-on-surface-variant">
              {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-colors cursor-pointer"
        >
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAddForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddProduct}
          className="mb-6 rounded-xl border border-secondary/20 bg-secondary/5 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <h3 className="text-sm font-bold text-primary">New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Title *</label>
              <input
                type="text"
                required
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Brand</label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Category *</label>
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Status</label>
              <select
                value={newProduct.status}
                onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as "draft" | "active" })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Original Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Description</label>
            <textarea
              rows={2}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-2">Product Images</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {newProduct.images.map((img, idx) => (
                <div key={img} className="relative h-16 w-16 rounded-lg bg-surface border border-outline-variant/30 overflow-hidden shrink-0 group">
                  <img src={img} alt="Product" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 h-5 w-5 bg-black/75 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-secondary/80 text-white text-[8px] font-bold text-center py-0.5 uppercase tracking-wider">
                      Main
                    </span>
                  )}
                </div>
              ))}
              
              <label className={`h-16 w-16 rounded-lg border-2 border-dashed border-outline-variant/40 hover:border-secondary/50 hover:bg-secondary/5 flex flex-col items-center justify-center text-outline hover:text-secondary cursor-pointer transition-all ${uploadingImage ? "animate-pulse" : ""}`}>
                <Plus className="h-5 w-5" />
                <span className="text-[9px] font-bold mt-1">{uploadingImage ? "Uploading" : "Add Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
            <p className="text-[10px] text-on-surface-variant">The first uploaded image will be used as the product thumbnail.</p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {isPending ? "Creating..." : "Create Product"}
          </button>
        </form>
      )}

      {/* Status Filters */}
      <div className="mb-4 flex gap-1.5">
        {["all", "active", "draft", "hidden", "removed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              statusFilter === s
                ? "bg-secondary text-white"
                : "bg-surface-container text-on-surface-variant hover:bg-surface"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === "all" && ` (${products.length})`}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package className="h-10 w-10 text-outline-variant mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">No products found.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary truncate">
                      {product.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        product.status === "active"
                          ? "bg-success/10 text-success"
                          : product.status === "hidden"
                          ? "bg-tertiary/10 text-tertiary"
                          : product.status === "removed"
                          ? "bg-error/10 text-error"
                          : "bg-outline-variant/20 text-on-surface-variant"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-on-surface-variant">
                    <span className="font-semibold text-on-surface">₹{product.price.toLocaleString()}</span>
                    <span>Stock: {product.stock}</span>
                    <span>{product.categoryName}</span>
                    {product.brand && <span>{product.brand}</span>}
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-tertiary fill-tertiary" />
                      <span>{product.rating} ({product.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {product.status === "active" ? (
                    <button
                      onClick={() => handleStatusChange(product.id, "hidden")}
                      title="Hide"
                      disabled={isPending}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(product.id, "active")}
                      title="Activate"
                      disabled={isPending}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-success transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(product.id, "removed")}
                    title="Archive"
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    title="Delete permanently"
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
