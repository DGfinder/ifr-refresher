"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function readInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("ifrTheme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function AppHeader() {
  const [isDark, setIsDark] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    localStorage.setItem("ifrTheme", newIsDark ? "dark" : "light");
    setIsDark(newIsDark);
  };

  return (
    <header className="border-b border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ifr-accent)]">
            IFR Quick Study
          </h1>
          <p className="text-xs text-[var(--ifr-text-muted)]">
            Australian IFR revision — free and offline
          </p>
        </div>
        {/* suppressHydrationWarning: server has no localStorage/matchMedia,
            so the rendered icon may differ on first paint. */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 transition-colors hover:bg-[var(--ifr-surface-muted)]"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          suppressHydrationWarning
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-[var(--ifr-text-muted)]" />
          ) : (
            <Moon className="h-5 w-5 text-[var(--ifr-text-muted)]" />
          )}
        </button>
      </div>
    </header>
  );
}
