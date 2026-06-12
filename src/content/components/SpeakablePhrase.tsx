"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface SpeakableLineProps {
  text: string;
  className?: string;
}

/**
 * Render a single block line, surfacing a 🔊 button next to any
 * single-quoted phraseology span so the learner can hear the call read
 * out by the browser's speech-synthesis engine.
 *
 * Heuristic for "speakable": a single-quoted span exists AND contains no
 * `[...]` placeholders (we don't want to speak template skeletons like
 * `'[Station], [callsign], request taxi.'`).
 *
 * Falls back to plain text when speech synthesis isn't available — never
 * blocks the line from rendering.
 */
export function SpeakableLine({ text, className }: SpeakableLineProps) {
  const segments = parseSpeakableSegments(text);
  if (!segments.some((s) => s.kind === "speakable")) {
    return <span className={className}>{text}</span>;
  }
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
        return (
          <span
            key={i}
            className="inline-flex items-baseline gap-1 whitespace-normal"
          >
            <span>&apos;{seg.value}&apos;</span>
            <SpeakerButton text={seg.value} />
          </span>
        );
      })}
    </span>
  );
}

interface Segment {
  kind: "text" | "speakable";
  value: string;
}

function parseSpeakableSegments(text: string): Segment[] {
  const out: Segment[] = [];
  let i = 0;
  while (i < text.length) {
    const quoteStart = text.indexOf("'", i);
    if (quoteStart === -1) {
      out.push({ kind: "text", value: text.slice(i) });
      break;
    }
    const quoteEnd = text.indexOf("'", quoteStart + 1);
    if (quoteEnd === -1) {
      out.push({ kind: "text", value: text.slice(i) });
      break;
    }
    if (quoteStart > i) {
      out.push({ kind: "text", value: text.slice(i, quoteStart) });
    }
    const inner = text.slice(quoteStart + 1, quoteEnd);
    // Skip apostrophes mid-word ("won't", "don't") — those land as
    // very short fragments between two longer runs of word chars and
    // aren't intended as phraseology delimiters.
    const isTemplate = inner.includes("[");
    const isProbablyApostrophe = inner.length < 3 || /^[a-z]+$/i.test(inner);
    if (isTemplate || isProbablyApostrophe) {
      // Treat the whole `'inner'` as text, not as a speakable span.
      out.push({ kind: "text", value: text.slice(quoteStart, quoteEnd + 1) });
    } else {
      out.push({ kind: "speakable", value: inner });
    }
    i = quoteEnd + 1;
  }
  return out;
}

interface SpeakerButtonProps {
  text: string;
}

/**
 * Tap to hear the phrase read by the browser's speech-synthesis engine.
 * Picks an English voice when one is available so the rendering matches
 * the AIP source. No audio assets needed — pure browser API.
 *
 * Speech synthesis ships in every modern browser and is gated at click
 * time, so the button renders unconditionally and just no-ops on a host
 * without the API (e.g. SSR or the rare browser without it).
 */
function SpeakerButton({ text }: SpeakerButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // Stop anything already queued so rapid taps don't pile up.
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(normaliseForSpeech(text));
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find((v) => v.lang.startsWith("en"));
    if (en) u.voice = en;
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Hear: ${text}`}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors",
        "text-[var(--ifr-text-muted)] hover:bg-[var(--ifr-accent)]/10 hover:text-[var(--ifr-accent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
        speaking && "text-[var(--ifr-accent)]",
      )}
    >
      <Volume2 size={12} aria-hidden="true" />
    </button>
  );
}

/**
 * Light-touch normalisation for the TTS engine: expand aviation
 * shorthands the default voice would otherwise mispronounce. Kept
 * intentionally narrow — anything more ambitious belongs in a dedicated
 * phrase-rendering module.
 */
function normaliseForSpeech(text: string): string {
  return text
    .replace(/\bFL(\d{2,3})\b/g, (_m, digits: string) =>
      `flight level ${digits.split("").join(" ")}`,
    )
    .replace(/\bQNH\b/g, "Q N H")
    .replace(/\bATIS\b/g, "ay-tiss")
    .replace(/\bSID\b/g, "sid")
    .replace(/\bILS\b/g, "I L S")
    .replace(/\bRNP\b/g, "R N P")
    .replace(/\bCTAF\b/g, "see-taff")
    .replace(/\bIFR\b/g, "I F R")
    .replace(/\bVFR\b/g, "V F R")
    .replace(/\bSARTIME\b/gi, "sar-time")
    .replace(/\bAFRU\b/g, "ay-froo");
}
