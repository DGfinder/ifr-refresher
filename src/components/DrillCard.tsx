"use client";

import { useState } from "react";
import type { DrillQuestion, DrillRating } from "@/types/drill";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface DrillCardProps {
  question: DrillQuestion;
  onRate: (rating: DrillRating) => void;
}

export function DrillCard({ question, onRate }: DrillCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleRate = (rating: DrillRating) => {
    onRate(rating);
    setShowAnswer(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {/* Header with metadata (breadcrumb) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-[13px] text-muted-foreground">
        <span>{question.sectionTitle}</span>
        <span className="text-border">·</span>
        <span>{question.moduleId}</span>
        {question.level && (
          <>
            <span className="text-border">·</span>
            <Badge variant={question.level}>{question.level}</Badge>
          </>
        )}
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-[18px] font-medium text-foreground">{question.question}</p>
      </div>

      {/* Answer section */}
      <div className="border-t border-border">
        {!showAnswer ? (
          <div className="p-4">
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full rounded-lg bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Show Answer
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "transform transition-all duration-300 ease-out",
              showAnswer
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            )}
          >
            {/* Answer text */}
            <div className="bg-muted border-y border-border px-6 py-4">
              <p className="text-foreground/90 leading-relaxed">{question.answer}</p>
            </div>

            {/* Rating buttons - outline style */}
            <div className="flex gap-3 p-4">
              <button
                onClick={() => handleRate("got-it")}
                className="flex-1 rounded-lg border-2 border-[var(--ifr-success)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--ifr-success)] transition-colors hover:bg-[var(--ifr-success)]/10"
              >
                Got it
              </button>
              <button
                onClick={() => handleRate("unsure")}
                className="flex-1 rounded-lg border-2 border-[var(--ifr-warning)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--ifr-warning)] transition-colors hover:bg-[var(--ifr-warning)]/10"
              >
                Unsure
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
