"use client";

import { useEffect, useCallback } from "react";
import type { QuizOptionId } from "@/types/drill";

interface UseKeyboardNavOptions {
  onSelectOption: (optionId: QuizOptionId) => void;
  onNext: () => void;
  onPause?: () => void;
  onSkip?: () => void;
  isAnswered: boolean;
  isEnabled?: boolean;
}

const OPTION_KEYS: Record<string, QuizOptionId> = {
  "1": "A",
  "2": "B",
  "3": "C",
  "4": "D",
  a: "A",
  b: "B",
  c: "C",
  d: "D",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
};

export function useKeyboardNav({
  onSelectOption,
  onNext,
  onPause,
  onSkip,
  isAnswered,
  isEnabled = true,
}: UseKeyboardNavOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key;

      // Option selection (1-4 or A-D)
      if (!isAnswered && key in OPTION_KEYS) {
        event.preventDefault();
        onSelectOption(OPTION_KEYS[key]);
        return;
      }

      // Next question (Enter or Space)
      if (isAnswered && (key === "Enter" || key === " ")) {
        event.preventDefault();
        onNext();
        return;
      }

      // Pause/menu (Escape)
      if (key === "Escape" && onPause) {
        event.preventDefault();
        onPause();
        return;
      }

      // Skip question (s key)
      if (!isAnswered && (key === "s" || key === "S") && onSkip) {
        event.preventDefault();
        onSkip();
        return;
      }
    },
    [isEnabled, isAnswered, onSelectOption, onNext, onPause, onSkip]
  );

  useEffect(() => {
    if (!isEnabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);
}
