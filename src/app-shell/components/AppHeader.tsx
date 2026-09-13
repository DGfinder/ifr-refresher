"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Moon, Navigation2 } from "lucide-react";

export function AppHeader() {
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => {
      let savedTheme: string | null = null;
      try { savedTheme = window.localStorage.getItem("ifrTheme"); } catch { /* Theme still works without storage. */ }
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
      setIsDark(shouldBeDark);
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, isHydrated]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem("ifrTheme", "dark"); } catch { /* Keep theme for this visit. */ }
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem("ifrTheme", "light"); } catch { /* Keep theme for this visit. */ }
    }
    setIsDark(newIsDark);
  };

  return (
    <header className="border-b border-[var(--ifr-border)] bg-[var(--ifr-surface)]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-3">Skip to content</a>
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-lg" aria-label="IFR Quick Study home">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--ifr-navy)] text-[var(--ifr-on-navy)]"><Navigation2 size={23} strokeWidth={1.7} aria-hidden="true" /></span>
          <span><span className="block text-xl font-semibold tracking-tight">IFR Quick Study</span><span className="block text-sm text-[var(--ifr-text-muted)]">The Australian IFR workbook</span></span>
        </Link>
        <button
          onClick={toggleTheme}
          type="button"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--ifr-border)] transition-colors hover:bg-[var(--ifr-surface-muted)]"
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
