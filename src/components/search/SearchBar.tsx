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

  // Debounced search suggestions fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
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
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, or local shops..."
          className="w-full h-11 pl-11 pr-10 text-sm bg-white text-on-surface border border-outline-variant rounded-lg outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-on-surface-variant/60"
        />
        {/* Left Search Icon */}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />

        {/* Clear/Loader Button */}
        {isLoading ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-slate-300 border-t-secondary animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {/* Autocomplete Suggestions Panel */}
      {isOpen && (query.trim().length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-96 overflow-y-auto bg-white rounded-lg border border-outline-variant shadow-observatory-lifted py-2">
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3.5 py-1 text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
                Suggestions
              </div>
              <ul className="mt-1">
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
                        className={`w-full text-left px-3.5 py-2 flex items-center gap-3 transition-colors ${
                          activeIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-slate-100 text-slate-500">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="h-7 w-7 object-cover rounded-sm" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-primary">{item.label}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
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
