"use client";

import { useEffect, useRef } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  dragX?: number;
  dragRotate?: number;
  isDragging?: boolean;
  /** Law block items from the module — shown as collapsible "📋 Regulation" on front side */
  moduleContext?: string[];
}

export function FlipCard({
  front,
  back,
  isFlipped,
  onFlip,
  dragX = 0,
  dragRotate = 0,
  isDragging = false,
  moduleContext = [],
}: FlipCardProps) {
  const hasContext = moduleContext.length > 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const cardTransform = isFlipped
    ? `rotateY(180deg) translateX(${-dragX}px) rotate(${-dragRotate}deg)`
    : `translateX(${dragX}px) rotate(${dragRotate}deg)`;
  const cardTransition = isDragging
    ? "none"
    : "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)";

  useEffect(() => {
    cardRef.current?.style.setProperty("--card-transform", cardTransform);
    cardRef.current?.style.setProperty("--card-transition", cardTransition);
  }, [cardTransform, cardTransition]);

  return (
    <div
      className="w-full cursor-pointer select-none [perspective:1200px]"
      onClick={!isFlipped ? onFlip : undefined}
    >
      <div
        ref={cardRef}
        className="relative min-h-[260px] w-full [transform-style:preserve-3d] [transform:var(--card-transform)] [transition:var(--card-transition)] md:min-h-[320px]"
      >
        {/* Front face */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] shadow-lg [backface-visibility:hidden]"
        >
          {front}
          {hasContext && (
            <div
              className="px-4 pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <details className="group">
                <summary className="cursor-pointer list-none text-xs font-medium text-[var(--ifr-text-muted)] hover:text-[var(--ifr-accent)] flex items-center gap-1 select-none">
                  <span className="transition-transform group-open:rotate-90">▶</span>
                  📋 Regulation
                </summary>
                <ul className="mt-2 space-y-1 border-t border-[var(--ifr-border)] pt-2">
                  {moduleContext.map((item, i) => (
                    <li key={i} className="text-xs text-[var(--ifr-text-muted)] leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-surface)] shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {back}
        </div>
      </div>
    </div>
  );
}
