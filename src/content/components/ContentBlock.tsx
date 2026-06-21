"use client";

import type { ContentBlock as ContentBlockType } from "@/content/model/section";
import { QACollapsibleItem, QACard } from "./QACollapsibleItem";
import { SpeakableLine } from "./SpeakablePhrase";
import { Callout, StoryList } from "./Callout";
import { RegulationCard } from "./RegulationCard";
import { NumbersGrid } from "./NumbersGrid";

// Shared IFR design token classes used by the simpler text/heading/list blocks.
const baseCardClasses = "mb-4 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)]/80 px-4 py-3 shadow-sm";
const titleClasses = "mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ifr-text-muted)]";

interface ContentBlockProps {
  block: ContentBlockType;
  /** When true, surface 🔊 buttons inside law / list block items that
   * contain quoted phraseology. Used by the radio-calls Learn tab so
   * learners can hear the canonical rendering of each call. */
  speakable?: boolean;
}

function renderListItem(text: string, speakable: boolean) {
  return speakable ? <SpeakableLine text={text} /> : text;
}

export function ContentBlock({ block, speakable = false }: ContentBlockProps) {
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
                {renderListItem(item, speakable)}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="mb-4 ml-6 list-disc space-y-1">
          {block.items.map((item, index) => (
            <li key={index} className="leading-relaxed text-foreground/90">
              {renderListItem(item, speakable)}
            </li>
          ))}
        </ul>
      );

    case "qa":
      // Tap-to-reveal pattern — same active-recall gate the
      // ipc_questions / airline_questions blocks already use. The answer
      // is hidden until the learner commits to a thought and taps.
      return <QACard question={block.question} answer={block.answer} />;

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
      // Renders one card per regulation, with the citation pulled out as a
      // small-caps header. The speakable prop currently no-ops for law blocks
      // — the radio-calls Learn tab uses SpeakableLine through the list/text
      // path; law blocks are passages of regulation, not phrases.
      return <RegulationCard items={block.content} />;

    case "numbers":
      return <NumbersGrid items={block.content} />;

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
      return <Callout variant="practice" title="In Practice" items={block.content} />;

    case "traps":
      return <Callout variant="trap" title="Common Traps" items={block.content} />;

    case "ipc_questions":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Likely IPC Questions</p>
          <ul className="space-y-2">
            {block.content.map((item, i) => (
              <QACollapsibleItem key={i} item={item} index={i} />
            ))}
          </ul>
        </div>
      );

    case "airline_questions":
      return (
        <div className={baseCardClasses}>
          <p className={titleClasses}>Airline Interview Questions</p>
          <ul className="space-y-2">
            {block.content.map((item, i) => (
              <QACollapsibleItem key={i} item={item} index={i} />
            ))}
          </ul>
        </div>
      );

    case "scenario":
      return <StoryList items={block.content} />;

    default:
      return null;
  }
}
