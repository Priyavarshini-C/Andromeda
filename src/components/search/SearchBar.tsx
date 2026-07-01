// =============================================================================
// Andromeda — Autocomplete Search Bar Component
// =============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Laptop, BookOpen, Home, Shirt, X, Tag, Store, Smartphone } from "lucide-react";
import { SearchSuggestion } from "@/lib/types";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(query.trim())}&limit=6`
        );
        if (response.ok) {
          const result = await response.json();
          setSuggestions(result.data.suggestions || []);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSuggestionClick = (item: SearchSuggestion) => {
    setIsOpen(false);
    setQuery("");
    if (item.type === "product") {
      router.push(`/products/${item.slug}`);
    } else if (item.type === "category") {
      router.push(`/products?category=${item.slug}`);
    } else if (item.type === "brand") {
      router.push(`/products?brand=${encodeURIComponent(item.label)}`);
    } else if (item.type === "seller") {
      // Fallback: search by seller name / filter
      router.push(`/products?q=${encodeURIComponent(item.label)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else {
        handleSearchSubmit(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full text-on-surface">
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(query);
        }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
            setActiveIndex(-1);
            if (val.trim().length < 2) {
              setSuggestions([]);
              setIsLoading(false);
            } else {
              setIsLoading(true);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, or local ateliers..."
          className="w-full h-12 pl-12 pr-10 text-xs tracking-wider bg-neutral-900/60 text-white border border-white/5 rounded-full outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-white/30"
        />
        {/* Left Search Icon */}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />

        {/* Clear/Loader Button */}
        {isLoading ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-slate-300 border-t-secondary animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsLoading(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {/* Autocomplete Suggestions Panel */}
      {isOpen && (query.trim().length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full max-h-96 overflow-y-auto bg-[#0E0E10]/95 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl py-3 text-white">
          {suggestions.length > 0 ? (
            <div>
              <div className="px-5 py-1 text-[9px] font-bold text-white/40 tracking-widest uppercase">
                Suggestions
              </div>
              <ul className="mt-2 space-y-0.5">
                {suggestions.map((item, index) => {
                  let Icon = Tag;
                  if (item.type === "product") Icon = Smartphone;
                  if (item.type === "category") Icon = Laptop;
                  if (item.type === "seller") Icon = Store;

                  return (
                    <li key={`${item.type}-${item.slug}-${index}`}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(item)}
                        className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${
                          activeIndex === index ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-white/50">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="h-8 w-8 object-cover rounded" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white/95 tracking-wide">{item.label}</p>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                            {item.type}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="px-3.5 py-3 text-sm text-on-surface-variant text-center">
              No matching products found
            </div>
          ) : null}

          {/* Quick Categories Help */}
          <div className="border-t border-outline-variant mt-2 pt-2">
            <div className="px-3.5 py-1 text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
              Popular Categories
            </div>
            <div className="grid grid-cols-2 gap-1 px-2.5 mt-1.5">
              {[
                { name: "Electronics", slug: "electronics", Icon: Laptop },
                { name: "Home & Kitchen", slug: "home-kitchen", Icon: Home },
                { name: "Books", slug: "books", Icon: BookOpen },
                { name: "Fashion", slug: "fashion", Icon: Shirt },
              ].map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/products?category=${cat.slug}`);
                  }}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="text-secondary">
                    <cat.Icon className="h-4 w-4" />
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
