"use client";

import { useState } from "react";
import type { Reference } from "@/types/section";
import { cn } from "@/lib/utils";

interface ReferencesProps {
  refs: Reference[];
}

export function References({ refs }: ReferencesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (refs.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <span>References ({refs.length})</span>
        <svg
          className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {refs.map((ref, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
            >
              <div className="font-medium text-foreground">
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {ref.source}
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ) : (
                  ref.source
                )}
              </div>
              <div className="mt-1 text-muted-foreground">
                {[ref.part && `Part ${ref.part}`, ref.chapter && `Chapter ${ref.chapter}`, ref.section && `Section ${ref.section}`]
                  .filter(Boolean)
                  .join(" | ")}
              </div>
              {ref.note && (
                <div className="mt-1 text-xs text-muted-foreground/80">
                  {ref.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
