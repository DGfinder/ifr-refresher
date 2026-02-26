"use client";

import type { ContentBlock as ContentBlockType } from "@/types/section";

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

    default:
      return null;
  }
}
