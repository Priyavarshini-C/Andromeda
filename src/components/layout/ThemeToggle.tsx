// =============================================================================
// Andromeda — Premium Theme Toggle Switch (Light / Dark)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from document class or localStorage
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    // Render placeholder with same dimensions to avoid layout shift
    return (
      <div className="w-14 h-7 rounded-full bg-primary-container/40 border border-outline-variant/10 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Toggle theme"
      className="group relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border border-outline-variant/30 bg-primary-container/85 dark:bg-surface-container transition-colors duration-300 focus:outline-hidden focus:ring-2 focus:ring-secondary-container/50"
    >
      {/* Background Icons */}
      <span className="absolute left-1.5 flex h-4 w-4 items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
        <Sun className="h-3.5 w-3.5 fill-current" />
      </span>
      <span className="absolute right-1.5 flex h-4 w-4 items-center justify-center text-slate-400 dark:text-sky-300 group-hover:scale-110 transition-transform">
        <Moon className="h-3.5 w-3.5 fill-current" />
      </span>

      {/* Sliding Knob */}
      <span
        className={`pointer-events-none flex h-5.5 w-5.5 transform items-center justify-center rounded-full bg-white dark:bg-primary shadow-md ring-0 transition duration-300 ease-in-out ${
          theme === "dark" ? "translate-x-7" : "translate-x-0.5"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="h-3 w-3 text-sky-400 fill-current" />
        ) : (
          <Sun className="h-3 w-3 text-amber-500 fill-current" />
        )}
      </span>
    </button>
  );
}
