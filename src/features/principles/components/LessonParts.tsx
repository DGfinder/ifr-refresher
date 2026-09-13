import type { ReactNode } from "react";
import { Lightbulb, BookOpen, ArrowUpRight } from "lucide-react";

export function ThinkThrough({ question, children }: { question: string; children: ReactNode }) {
  return (
    <section className="workbook-panel mt-6 p-5 md:p-6" aria-label="Check your understanding">
      <p className="eyebrow flex items-center gap-2"><Lightbulb size={17} aria-hidden="true" />Check your understanding</p>
      <h3 className="mt-3 text-xl font-semibold">{question}</h3>
      <details className="mt-4">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-[var(--ifr-accent)]">Show explanation</summary>
        <div className="mt-2 max-w-3xl leading-relaxed text-[var(--ifr-text-muted)]">{children}</div>
      </details>
    </section>
  );
}

export function LessonSources({ pages, primaryUrl, primaryTitle }: { pages: string; primaryUrl: string; primaryTitle: string }) {
  return (
    <details className="mt-6 border-t border-[var(--ifr-border)] pt-4 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold"><BookOpen size={17} aria-hidden="true" />Teaching reference & source notes</summary>
      <div className="mt-3 space-y-2 text-[var(--ifr-text-muted)]">
        <p>IFR Cheat Sheet · Ben Montgomery-Schinkel · V7.1, 30 March 2024 · pp. {pages}. These original diagrams explain the concepts; they do not reproduce an operational chart.</p>
        <a href={primaryUrl} target="_blank" rel="noreferrer" className="workbook-link">{primaryTitle}<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        <p>Source comparison: 13 September 2026. This records an editorial cross-check, not instructor sign-off. Current charts, aircraft capabilities and operating requirements govern actual flight.</p>
      </div>
    </details>
  );
}

export function DiagramFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <figure className="min-w-0 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-bg)] p-3 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3"><span className="eyebrow">{title}</span><span className="text-xs text-[var(--ifr-text-muted)]">Training schematic</span></div>
      {children}
      <figcaption className="mt-4 border-t border-[var(--ifr-border)] pt-3 text-base text-[var(--ifr-text-muted)]">{description}</figcaption>
    </figure>
  );
}
