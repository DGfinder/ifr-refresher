"use client";

import type { ContentBlock as ContentBlockType } from "@/types/section";

// Shared IFR design token classes
const baseCardClasses = "mb-4 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)]/80 px-4 py-3 shadow-sm";
const titleClasses = "mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ifr-text-muted)]";
const listClasses = "ml-4 list-disc space-y-1 text-sm leading-relaxed text-[var(--ifr-text)]";

interface ContentBlockProps {
  block: ContentBlockType;
}

export function ContentBlock({ block }: ContentBlockProps) {
  switch (block.type) {
    case "heading":
      if (block.level === 2) {
        return (
          <h2 className="mb-3 mt-6 text-xl font-semibold text-foreground first:mt-0">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 className="mb-2 mt-4 text-lg font-medium text-foreground first:mt-0">
          {block.text}
        </h3>
      );

    case "text":
      return (
        <p className="mb-4 leading-relaxed text-foreground/90">{block.text}</p>
      );

    case "list":
      if (block.style === "numbered") {
        return (
          <ol className="mb-4 ml-6 list-decimal space-y-1">
            {block.items.map((item, index) => (
              <li key={index} className="leading-relaxed text-foreground/90">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="mb-4 ml-6 list-disc space-y-1">
          {block.items.map((item, index) => (
            <li key={index} className="leading-relaxed text-foreground/90">
              {item}
            </li>
          ))}
        </ul>
      );

    case "qa":
      return (
        <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-2 font-medium text-foreground">
            Q: {block.question}
          </p>
          <p className="text-foreground/90">A: {block.answer}</p>
        </div>
      );

    case "hierarchy":
      return (
        <div className="my-4 space-y-0">
          {block.items.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="rounded border border-border bg-muted/30 px-4 py-2 text-center text-sm font-medium">
                {item}
              </div>
              {i < block.items.length - 1 && (
                <div className="flex h-6 items-center justify-center text-muted-foreground">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "law":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>The Law</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "numbers":
      if (!block.content.length) return null;
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Key Numbers</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "reference":
      if (!block.content.length) return null;
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Reference</p>
          <ul className="space-y-1">
            {block.content.map((item, i) => (
              <li key={i} className="font-mono text-sm text-[var(--ifr-text)]/80">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "ops_context":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Why This Matters</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "traps":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Where Pilots Get Caught</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "ipc_questions":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>IPC Oral Questions</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "airline_questions":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Airline Panel Questions</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "scenario":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Scenario</p>
          <ul className={listClasses}>
            {block.content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}
