"use client";

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

  return (
    <div
      style={{ perspective: "1200px" }}
      className="w-full cursor-pointer select-none"
      onClick={!isFlipped ? onFlip : undefined}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: isDragging
            ? "none"
            : isFlipped
            ? "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)"
            : "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped
            ? `rotateY(180deg) translateX(${-dragX}px) rotate(${-dragRotate}deg)`
            : `translateX(${dragX}px) rotate(${dragRotate}deg)`,
          minHeight: "260px",
        }}
        className="relative w-full md:min-h-[320px]"
      >
        {/* Front face */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 flex flex-col rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] shadow-lg"
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
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 flex flex-col rounded-2xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-surface)] shadow-lg"
        >
          {back}
        </div>
      </div>
    </div>
  );
}
