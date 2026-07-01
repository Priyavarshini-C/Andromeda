// =============================================================================
// Andromeda — Premium Search Results & Interactive Filters (Client Component)
// =============================================================================

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Laptop, BookOpen, Home, Shirt, SlidersHorizontal, 
  Star, ChevronDown, Check, X, ShieldAlert 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/lib/utils/mock-data";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  productCount: number;
}

interface ProductsPageClientProps {
  initialProducts: Product[];
  categoriesWithCounts: CategoryWithCount[];
  categorySlug?: string;
  title: string;
  subtitle: string;
  totalProductsCount: number;
}

export default function ProductsPageClient({
  initialProducts,
  categoriesWithCounts,
  categorySlug = "",
  title,
  subtitle,
  totalProductsCount
}: ProductsPageClientProps) {
  // Client States
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);

  // Toggle Collapse States
  const [categoryCollapsed, setCategoryCollapsed] = useState(false);
  const [priceCollapsed, setPriceCollapsed] = useState(false);
  const [ratingCollapsed, setRatingCollapsed] = useState(false);
  const [statusCollapsed, setStatusCollapsed] = useState(false);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Price Filter
      if (product.price > maxPrice) return false;

      // 2. Rating Filter
      if (selectedRating !== null && product.rating < selectedRating) return false;

      // 3. Stock Availability Filter
      if (inStockOnly && product.stock <= 0) return false;

      // 4. Discount Filter
      if (selectedDiscount !== null) {
        const discountPct = product.listPrice && product.listPrice > product.price
          ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
          : 0;
        if (discountPct < selectedDiscount) return false;
      }

      return true;
    });
  }, [initialProducts, maxPrice, selectedRating, inStockOnly, selectedDiscount]);

  const handleClearFilters = () => {
    setSelectedRating(null);
    setMaxPrice(100000);
    setInStockOnly(false);
    setSelectedDiscount(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full bg-[#FAF6F2] text-charcoal">
      
      {/* ── Header Banner ── */}
      <div className="mb-8 border-b border-[#E8D8CE] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-medium tracking-tight text-charcoal">
            {title}
          </h1>
          <p className="mt-2 text-sm text-smoke font-light">
            {subtitle} • {filteredProducts.length} listings surfaced
          </p>
        </div>

        {/* Filters Summary / Clear Button */}
        {(selectedRating !== null || maxPrice < 100000 || inStockOnly || selectedDiscount !== null) && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-[#C4607A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Clear Active Filters <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── Sidebar Filters (Span 260px) ── */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full lg:w-64 shrink-0 flex flex-col gap-5"
        >
          {/* Headline */}
          <div className="flex items-center justify-between border-b border-[#E8D8CE] pb-3">
            <span className="text-xs uppercase tracking-[3px] font-sans font-semibold text-[#1C1410] flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-rose" />
              Filters
            </span>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-[#C4607A] hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Block 1: Categories list */}
          <div className="border-b border-[#E8D8CE] pb-4">
            <button 
              onClick={() => setCategoryCollapsed(!categoryCollapsed)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-charcoal uppercase tracking-wider text-left cursor-pointer"
            >
              <span>Category Selection</span>
              <ChevronDown className={`h-4 w-4 text-smoke transition-transform ${categoryCollapsed ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence initial={false}>
              {!categoryCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-2"
                >
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/products"
                        className={`flex items-center justify-between p-2 rounded text-xs font-semibold transition-all ${
                          !categorySlug ? "bg-rose text-white" : "text-smoke hover:bg-parchment"
                        }`}
                      >
                        <span>All Categories</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                          !categorySlug ? "bg-white/20 text-white" : "bg-[#F0E0D4] text-[#8B3A52]"
                        }`}>
                          {totalProductsCount}
                        </span>
                      </Link>
                    </li>
                    {categoriesWithCounts.map((cat) => {
                      const Icon = cat.slug === "electronics" ? Laptop : 
                                  cat.slug === "books" ? BookOpen : 
                                  cat.slug === "home-kitchen" ? Home : Shirt;
                      const isSelected = categorySlug === cat.slug;
                      
                      return (
                        <li key={cat.id}>
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className={`flex items-center justify-between p-2 rounded text-xs font-semibold transition-all ${
                              isSelected ? "bg-rose text-white" : "text-smoke hover:bg-parchment"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
                              {cat.name}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-white/20 text-white" : "bg-[#F0E0D4] text-[#8B3A52]"
                            }`}>
                              {cat.productCount}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Block 2: Price Range Filter */}
          <div className="border-b border-[#E8D8CE] pb-4">
            <button 
              onClick={() => setPriceCollapsed(!priceCollapsed)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-charcoal uppercase tracking-wider text-left cursor-pointer"
            >
              <span>Price Range Limit</span>
              <ChevronDown className={`h-4 w-4 text-smoke transition-transform ${priceCollapsed ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence initial={false}>
              {!priceCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1 bg-[#E8D8CE] rounded-lg appearance-none cursor-pointer accent-[#8B3A52]"
                  />
                  <div className="flex justify-between items-center text-[11px] text-smoke mt-2 font-medium">
                    <span>Min: ₹1,000</span>
                    <span className="text-[#C07840] font-semibold">Max: ₹{maxPrice.toLocaleString("en-IN")}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Block 3: Rating Stars Filter */}
          <div className="border-b border-[#E8D8CE] pb-4">
            <button 
              onClick={() => setRatingCollapsed(!ratingCollapsed)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-charcoal uppercase tracking-wider text-left cursor-pointer"
            >
              <span>Atelier Rating</span>
              <ChevronDown className={`h-4 w-4 text-smoke transition-transform ${ratingCollapsed ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence initial={false}>
              {!ratingCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <ul className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rate) => (
                      <li key={rate}>
                        <button
                          onClick={() => setSelectedRating(selectedRating === rate ? null : rate)}
                          className={`flex items-center gap-2 text-xs transition-colors w-full text-left font-medium ${
                            selectedRating === rate ? "text-[#C4607A]" : "text-smoke hover:text-charcoal"
                          }`}
                        >
                          <div className={`h-4.5 w-4.5 rounded border border-[#E8D8CE] flex items-center justify-center bg-white ${
                            selectedRating === rate ? "border-[#C4607A] bg-[#C4607A]/10 text-[#C4607A]" : ""
                          }`}>
                            {selectedRating === rate && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex items-center gap-0.5 text-goldmist">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.floor(rate) ? "fill-current" : "text-zinc-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span>{rate} &amp; Up</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Block 4: Availability & Offers */}
          <div className="border-b border-[#E8D8CE] pb-4">
            <button 
              onClick={() => setStatusCollapsed(!statusCollapsed)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-charcoal uppercase tracking-wider text-left cursor-pointer"
            >
              <span>Availability &amp; Deals</span>
              <ChevronDown className={`h-4 w-4 text-smoke transition-transform ${statusCollapsed ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence initial={false}>
              {!statusCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden space-y-4"
                >
                  {/* Stock Toggle */}
                  <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-smoke">
                    <span>Instock Options Only</span>
                    <button
                      type="button"
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        inStockOnly ? "bg-[#8B3A52]" : "bg-zinc-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          inStockOnly ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>

                  {/* Discount Offers */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-smoke uppercase font-semibold">Minimum Discount</p>
                    {[10, 20, 30].map((discount) => (
                      <button
                        key={discount}
                        onClick={() => setSelectedDiscount(selectedDiscount === discount ? null : discount)}
                        className={`flex items-center gap-2 text-xs transition-colors w-full text-left font-medium ${
                          selectedDiscount === discount ? "text-[#C4607A]" : "text-smoke hover:text-charcoal"
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded border border-[#E8D8CE] flex items-center justify-center bg-white ${
                          selectedDiscount === discount ? "border-[#C4607A] bg-[#C4607A]/10 text-[#C4607A]" : ""
                        }`}>
                          {selectedDiscount === discount && <Check className="h-3 w-3" />}
                        </div>
                        <span>{discount}% OFF &amp; More</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => console.log("Filters Applied")}
            className="w-full bg-[#1C1410] hover:bg-charcoal text-[#FAF6F2] py-3 rounded-[8px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
          >
            Apply Filters
          </button>

        </motion.aside>

        {/* ── Main Product Grid (Flex 1) ── */}
        <main className="flex-grow">
          <ProductGrid 
            products={filteredProducts} 
            emptyMessage="No premium products cataloged matching these filters." 
          />
        </main>

      </div>

    </div>
  );
}
