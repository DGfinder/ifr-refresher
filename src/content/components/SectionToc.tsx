"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentBlock } from "@/content/model/section";
import { cn } from "@/shared/lib/cn";
import { parseRegulation } from "./regulationParse";

interface SectionTocProps {
  /** The blocks shown in the current tab — used to derive the chip list. */
  blocks: readonly ContentBlock[];
  /** Stable id prefix for the anchor elements the parent wraps each block
   * in (typically `${moduleId}:${tab}`). Must match what the parent renders. */
  anchorPrefix: string;
}

interface TocEntry {
  /** Index into the original blocks array — matches the anchor id. */
  index: number;
  label: string;
}

const LABEL_FOR_TYPE: Partial<Record<ContentBlock["type"], string>> = {
  law: "Regulation",
  numbers: "Numbers",
  ops_context: "In Practice",
  traps: "Traps",
  scenario: "Scenario",
  hierarchy: "Hierarchy",
  reference: "Reference",
  qa: "Q&A",
  ipc_questions: "IPC Q&A",
  airline_questions: "Airline Q&A",
};

/**
 * Sticky in-tab navigation strip. One chip per major block in the tab —
 * tap to jump, scroll to follow. The chip for the block currently
 * intersecting the top of the viewport is highlighted via IntersectionObserver.
 *
 * Hidden for tabs with fewer than 3 navigable blocks — the chip bar would
 * be more noise than help for short modules.
 */
export function SectionToc({ blocks, anchorPrefix }: SectionTocProps) {
  const entries = buildEntries(blocks);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef(new Map<number, HTMLAnchorElement>());

  useEffect(() => {
    if (entries.length === 0) return;
    // Match each chip's block via id. The observer fires whenever any
    // tracked block crosses the rootMargin band near the top of the
    // viewport; we pick whichever observed entry is highest in the
    // document and currently intersecting.
    const observed: Element[] = [];
    for (const entry of entries) {
      const el = document.getElementById(`${anchorPrefix}:${entry.index}`);
      if (el) observed.push(el);
    }
    if (observed.length === 0) return;

    const visibility = new Map<number, number>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const idAttr = record.target.id;
          const idx = parseTrailingIndex(idAttr);
          if (idx === null) continue;
          visibility.set(idx, record.intersectionRatio);
        }
        // Active chip = the lowest-index entry currently visible. Walking
        // in order preserves a stable, top-down reading experience instead
        // of bouncing to whichever block is "most visible" pixel-wise.
        let next: number | null = null;
        for (const entry of entries) {
          const ratio = visibility.get(entry.index) ?? 0;
          if (ratio > 0) {
            next = entry.index;
            break;
          }
        }
        if (next !== null) setActiveIndex(next);
      },
      {
        // 90px below the sticky chip bar so the active state flips when
        // the heading clears the bar, not when its top pixel does.
        rootMargin: "-90px 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    for (const el of observed) observer.observe(el);
    return () => observer.disconnect();
  }, [entries, anchorPrefix]);

  // Keep the active chip scrolled into view within the horizontally-
  // scrollable strip. Avoids the user losing track on long pages.
  useEffect(() => {
    if (activeIndex === null) return;
    const chip = chipRefs.current.get(activeIndex);
    const container = containerRef.current;
    if (!chip || !container) return;
    const chipLeft = chip.offsetLeft;
    const chipRight = chipLeft + chip.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;
    if (chipLeft < viewLeft || chipRight > viewRight) {
      container.scrollTo({
        left: Math.max(0, chipLeft - 16),
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  if (entries.length < 3) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-0 z-20 -mx-1 mb-4 bg-[var(--ifr-background,white)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--ifr-background,white)]/80"
    >
      <div
        ref={containerRef}
        className="flex gap-1.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {entries.map((entry) => {
          const active = activeIndex === entry.index;
          return (
            <a
              key={entry.index}
              href={`#${anchorPrefix}:${entry.index}`}
              ref={(el) => {
                if (el) chipRefs.current.set(entry.index, el);
                else chipRefs.current.delete(entry.index);
              }}
              onClick={(e) => {
                // Use a manual smooth-scroll so the offset clears the
                // sticky bar — browser default anchor scroll lands the
                // heading right under the bar where it's hidden.
                e.preventDefault();
                const target = document.getElementById(
                  `${anchorPrefix}:${entry.index}`,
                );
                if (!target) return;
                const offset = 64; // sticky bar height + breathing room
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
              }}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                active
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)] text-white"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]",
              )}
            >
              {entry.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Pick the blocks worth being chips. Headings get their own chip with the
 * heading text; LAW blocks pull the subject out of the first item so each
 * regulation gets a meaningful chip instead of the generic "Regulation"
 * label seven times in a row. Other structural blocks use the static type
 * label. Plain text / list paragraphs aren't navigable on their own.
 */
function buildEntries(blocks: readonly ContentBlock[]): TocEntry[] {
  const out: TocEntry[] = [];
  let previousType: ContentBlock["type"] | null = null;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    // Collapse runs of qa blocks — CS-006B and similar modules author each
    // Q&A as its own qa block, which used to surface as 13 identical "Q&A"
    // chips. Keep only the first in any sequential run.
    if (block.type === "qa" && previousType === "qa") {
      previousType = block.type;
      continue;
    }
    previousType = block.type;

    if (block.type === "heading") {
      out.push({ index: i, label: truncate(block.text, 28) });
      continue;
    }
    if (block.type === "law") {
      const first = block.content[0] ?? "";
      const { subject, citation } = parseRegulation(first);
      const label = subject ?? citation ?? "Regulation";
      out.push({ index: i, label: truncate(label, 28) });
      continue;
    }
    const staticLabel = LABEL_FOR_TYPE[block.type];
    if (staticLabel) {
      out.push({ index: i, label: staticLabel });
    }
  }
  return out;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function parseTrailingIndex(id: string): number | null {
  const idx = id.lastIndexOf(":");
  if (idx === -1) return null;
  const n = Number(id.slice(idx + 1));
  return Number.isInteger(n) ? n : null;
}
