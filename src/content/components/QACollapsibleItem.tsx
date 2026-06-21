"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { cn } from "@/shared/lib/cn";

interface QAItemProps {
  item: string;
  /** Stable key for the Collapsible's internal state. */
  index: number;
}

/**
 * Renders a single "Q: ... A: ..." entry as a tap-to-reveal card.
 *
 * The question stays visible at all times. The answer is hidden behind a
 * Collapsible so the student has to *commit to a thought* before peeking
 * — the core mechanic for active recall.
 *
 * Doubles as a quick-reference: tap once to reveal, tap again to hide.
 */
export function QACollapsibleItem({ item }: QAItemProps) {
  const split = splitQA(item);

  // If the item doesn't follow the "Q: ... A: ..." convention, fall back to
  // rendering it as plain text so misformatted content doesn't break the UI.
  if (!split) {
    return <li className="text-sm leading-relaxed text-[var(--ifr-text)]">{item}</li>;
  }

  return (
    <li>
      <QACard question={split.question} answer={split.answer} />
    </li>
  );
}

interface QACardProps {
  question: string;
  answer: string;
}

/**
 * Structured Q&A card — same visual as QACollapsibleItem but takes
 * `{question, answer}` directly. Used by the `qa` content block type
 * which stores the two fields separately, so we don't have to round-trip
 * through a "Q: ... A: ..." string just to parse it back.
 */
export function QACard({ question, answer }: QACardProps) {
  return (
    <Collapsible className="group mb-3 rounded-lg border border-[var(--ifr-border)]/60 bg-[var(--ifr-surface)] transition-colors data-[state=open]:border-[var(--ifr-accent)]/30 data-[state=open]:bg-[var(--ifr-accent)]/5">
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)] focus-visible:ring-inset",
        )}
      >
        <span className="text-sm font-medium leading-relaxed text-[var(--ifr-text)]">
          {question}
        </span>
        <ChevronDown
          size={16}
          className="mt-0.5 shrink-0 text-[var(--ifr-text-muted)] transition-transform group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <p className="border-t border-[var(--ifr-border)]/50 pt-2.5 text-sm leading-relaxed text-[var(--ifr-text)]">
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ifr-accent)]">
            Answer
          </span>
          {answer}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Parse a "Q: <question text> A: <answer text>" string into its parts.
 * Returns null if the format doesn't match (caller falls back to plain
 * text rendering).
 *
 * Permissive on the question marker — accepts "Q:" or "Q.". The answer
 * marker is matched as " A:" to avoid mistakenly splitting on an "A:"
 * that appears inside the question text.
 */
function splitQA(item: string): { question: string; answer: string } | null {
  const trimmed = item.trim();
  const stripQ = trimmed.replace(/^Q[:.]?\s*/i, "");
  if (stripQ === trimmed) return null;
  const aMatch = stripQ.match(/\s+A[:.]?\s+/);
  if (!aMatch || aMatch.index === undefined) return null;
  const question = stripQ.slice(0, aMatch.index).trim();
  const answer = stripQ.slice(aMatch.index + aMatch[0].length).trim();
  if (!question || !answer) return null;
  return { question, answer };
}

export { splitQA };

