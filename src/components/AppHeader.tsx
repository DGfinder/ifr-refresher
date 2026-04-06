"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function AppHeader() {
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("ifrTheme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
    setIsHydrated(true);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ifrTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ifrTheme", "light");
    }
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
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 transition-colors hover:bg-[var(--ifr-surface-muted)]"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isHydrated ? (
            isDark ? (
              <Sun className="h-5 w-5 text-[var(--ifr-text-muted)]" />
            ) : (
              <Moon className="h-5 w-5 text-[var(--ifr-text-muted)]" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}
