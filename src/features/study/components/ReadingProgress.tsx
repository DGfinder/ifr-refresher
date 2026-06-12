"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";

interface ReadingProgressProps {
  /** Stable identifier of the thing being read — when this changes, the
   * bar resets to 0 instead of carrying scroll state across modules. */
  trackingKey: string;
  className?: string;
}

/**
 * Sticky thin bar at the top of the page showing how far down the
 * document the user has scrolled. Mounts a passive scroll listener tied
 * to the page-level scrolling element (the document scroll on this app
 * since the main content scrolls the page, not an inner container).
 *
 * Keeps state local and listener cleanup tight — no global stores or
 * effect leaks. Resets to 0 whenever `trackingKey` changes so navigating
 * between modules starts each new module fresh.
 */
function InnerReadingProgress({ className }: { className?: string }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const compute = () => {
      const doc = document.documentElement;
      // Total scrollable distance: page height minus viewport height. When
      // the page is shorter than the viewport, treat the bar as already
      // complete so it doesn't sit at 0% on a tiny module.
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setPercent(100);
        return;
      }
      const scrolled = window.scrollY;
      const ratio = Math.min(100, Math.max(0, (scrolled / max) * 100));
      setPercent(ratio);
    };

    // rAF-throttle so we update at most once per frame regardless of how
    // many scroll events fire (touch scroll on iOS can be ~120/s).
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-0.5 bg-[var(--ifr-border)]/40 pointer-events-none",
        className,
      )}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <div
        className="h-full bg-[var(--ifr-accent)] transition-transform duration-150"
        style={{
          width: "100%",
          transform: `translateX(-${100 - percent}%)`,
        }}
      />
    </div>
  );
}

/**
 * Outer wrapper keyed by `trackingKey` so a module change triggers a fresh
 * mount (and thus a fresh `percent: 0` state) without needing a
 * set-state-in-effect to reset.
 */
export function ReadingProgress({ trackingKey, className }: ReadingProgressProps) {
  return (
    <InnerReadingProgress
      key={trackingKey}
      {...(className ? { className } : {})}
    />
  );
}
