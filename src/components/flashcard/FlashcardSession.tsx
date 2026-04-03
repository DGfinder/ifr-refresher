"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import type { DrillQuestion, DrillRating } from "@/types/drill";
import type { ProgramId } from "@/types/programs";
import { FlipCard } from "./ui/FlipCard";
import { RatingButtons } from "./ui/RatingButtons";
import { CardProgress } from "./ui/CardProgress";
import { useDrill } from "@/hooks/useDrill";
import { getModuleContext } from "@/utils/drill";
import { sections } from "@/data/sections";

export interface SessionResults {
  total: number;
  gotIt: number;
  unsure: number;
}

interface FlashcardSessionProps {
  queue: DrillQuestion[];
  programId: ProgramId;
  onEnd: (results: SessionResults) => void;
}

const SWIPE_THRESHOLD = 50;
const TILT_MAX = 12; // degrees

export function FlashcardSession({ queue, programId, onEnd }: FlashcardSessionProps) {
  const { updateRating } = useDrill(sections, { programId, mode: programId === "smart_review" ? "fsrs" : "adaptive" });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false);
  const [gotItCount, setGotItCount] = useState(0);
  const [unsureCount, setUnsureCount] = useState(0);
  const [streak, setStreak] = useState(0);

  // Swipe/drag state
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const currentCard = queue[currentIndex] ?? null;
  const total = queue.length;

  const advance = useCallback(
    (rating: DrillRating) => {
      if (!currentCard) return;
      updateRating(currentCard.id, rating);

      const newGotIt = gotItCount + (rating === "got-it" ? 1 : 0);
      const newUnsure = unsureCount + (rating === "unsure" ? 1 : 0);

      if (rating === "got-it") {
        setGotItCount(newGotIt);
        setStreak((s) => s + 1);
      } else {
        setUnsureCount(newUnsure);
        setStreak(0);
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        onEnd({ total, gotIt: newGotIt, unsure: newUnsure });
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
        setDragX(0);
      }
    },
    [currentCard, currentIndex, total, gotItCount, unsureCount, updateRating, onEnd]
  );

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
    setHasFlippedOnce(true);
  }, []);

  const handleEnd = useCallback(() => {
    onEnd({ total: currentIndex, gotIt: gotItCount, unsure: unsureCount });
  }, [onEnd, currentIndex, gotItCount, unsureCount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") {
        handleEnd();
        return;
      }
      if (!isFlipped) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleFlip();
        }
      } else {
        if (e.key === "ArrowRight") advance("got-it");
        if (e.key === "ArrowLeft") advance("unsure");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, handleFlip, advance, handleEnd]);

  // Pointer/swipe handlers (only active after flip)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isFlipped) return;
    dragStartX.current = e.clientX;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dragStartX.current === null) return;
    setDragX(e.clientX - dragStartX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = dragX;
    setDragX(0);
    dragStartX.current = null;
    if (dx > SWIPE_THRESHOLD) advance("got-it");
    else if (dx < -SWIPE_THRESHOLD) advance("unsure");
  };

  const dragRotate = isDragging ? (dragX / 300) * TILT_MAX : 0;

  if (!currentCard) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleEnd}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--ifr-border)] text-[var(--ifr-text-muted)] transition-colors hover:border-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
          aria-label="End session"
        >
          <X size={16} />
        </button>
        <div className="flex-1">
          <CardProgress current={currentIndex + 1} total={total} />
        </div>
        {streak >= 3 && (
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>🔥</span>
            <span>{streak}</span>
          </div>
        )}
      </div>

      {/* Card stack */}
      <div
        className="relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Stack shadow layers */}
        {currentIndex + 2 < total && (
          <div className="absolute inset-x-4 bottom-0 top-2 rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] opacity-40" />
        )}
        {currentIndex + 1 < total && (
          <div className="absolute inset-x-2 bottom-0 top-1 rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] opacity-70" />
        )}

        {/* Swipe direction hints */}
        {isDragging && dragX > 20 && (
          <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-xl border-2 border-emerald-500/60 bg-emerald-500/20 px-3 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            Got it ✓
          </div>
        )}
        {isDragging && dragX < -20 && (
          <div className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-xl border-2 border-amber-500/60 bg-amber-500/20 px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400">
            ↩ Unsure
          </div>
        )}

        <div className="relative z-10">
          <FlipCard
            isFlipped={isFlipped}
            onFlip={handleFlip}
            dragX={dragX}
            dragRotate={dragRotate}
            isDragging={isDragging}
            moduleContext={getModuleContext(sections, currentCard.sectionId, currentCard.moduleId)}
            front={
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-center text-lg font-medium leading-relaxed text-[var(--ifr-text)] md:text-xl">
                    {currentCard.prompt}
                  </p>
                </div>
                <div className="border-t border-[var(--ifr-border)] pt-3 text-xs text-[var(--ifr-text-muted)]">
                  {currentCard.sectionTitle} › {currentCard.moduleTitle}
                </div>
              </div>
            }
            back={
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-1 items-start">
                  <p className="text-sm leading-relaxed text-[var(--ifr-text)] md:text-base">
                    {currentCard.answer}
                  </p>
                </div>
                <div className="border-t border-[var(--ifr-accent)]/20 pt-3">
                  <span className="rounded-full border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--ifr-accent)]">
                    {currentCard.kind}
                  </span>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Flip hint / Rating buttons */}
      {!isFlipped ? (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleFlip}
            className="w-full rounded-xl border-2 border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/10 py-4 text-sm font-semibold text-[var(--ifr-accent)] transition-all hover:border-[var(--ifr-accent)]/70 hover:bg-[var(--ifr-accent)]/15 active:scale-[0.98]"
          >
            Reveal Answer
          </button>
          {!hasFlippedOnce && (
            <p className="text-xs text-[var(--ifr-text-muted)]">
              Tap card or press{" "}
              <kbd className="rounded border border-[var(--ifr-border)] px-1 font-mono text-[10px]">
                Space
              </kbd>{" "}
              to flip
            </p>
          )}
        </div>
      ) : (
        <RatingButtons onRate={advance} />
      )}
    </div>
  );
}
