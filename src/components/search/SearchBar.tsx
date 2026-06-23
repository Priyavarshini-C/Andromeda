"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Laptop, BookOpen, Home, Shirt, X } from "lucide-react";
import { getProductsBySearch, PRODUCTS, CATEGORIES, Product } from "@/lib/utils/mock-data";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter suggestions as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const matches = getProductsBySearch(query).slice(0, 5);
    setSuggestions(matches);
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
        const selected = suggestions[activeIndex];
        setQuery(selected.title);
        setIsOpen(false);
        router.push(`/products/${selected.slug}`);
      } else {
        handleSearchSubmit(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
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
        
        {/* Clear Button */}
        {query && (
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
        )}
      </form>

      {/* Autocomplete Suggestions Panel */}
      {isOpen && (query.trim().length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-96 overflow-y-auto bg-white rounded-lg border border-outline-variant shadow-observatory-lifted py-2">
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3.5 py-1 text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                Product Matches
              </div>
              <ul className="mt-1">
                {suggestions.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(item.title);
                        setIsOpen(false);
                        router.push(`/products/${item.slug}`);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                        activeIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">{item.title}</p>
                        <p className="text-xs text-on-surface-variant font-medium">in {item.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-secondary">from ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="px-3.5 py-3 text-sm text-on-surface-variant text-center">
              No matching products found
            </div>
          )}

          {/* Quick Categories Help */}
          <div className="border-t border-outline-variant mt-2 pt-2">
            <div className="px-3.5 py-1 text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
              Popular Categories
            </div>
            <div className="grid grid-cols-2 gap-1 px-2.5 mt-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/products?category=${cat.slug}`);
                  }}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 text-left text-xs font-medium text-slate-700 transition-colors"
                >
                  <span className="text-secondary">
                    {cat.slug === "electronics" && <Laptop className="h-4 w-4" />}
                    {cat.slug === "books" && <BookOpen className="h-4 w-4" />}
                    {cat.slug === "home-kitchen" && <Home className="h-4 w-4" />}
                    {cat.slug === "fashion" && <Shirt className="h-4 w-4" />}
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
