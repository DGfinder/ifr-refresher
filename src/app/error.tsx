"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Next.js error boundary — rendered when an unhandled error
 * bubbles up through any route segment.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Forward to error monitoring (Sentry etc.) when integrated
    console.error("[IFR Global Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">✈️💥</span>
      <h1 className="text-xl font-bold text-[var(--ifr-text)]">Unexpected turbulence</h1>
      <p className="max-w-sm text-sm text-[var(--ifr-text-muted)]">
        Something crashed. Your study progress is safe — it&apos;s stored locally.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-[var(--ifr-text-muted)]">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--ifr-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
