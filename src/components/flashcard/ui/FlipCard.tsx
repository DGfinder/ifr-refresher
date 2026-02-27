"use client";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  dragX?: number;
  dragRotate?: number;
  isDragging?: boolean;
}

export function FlipCard({
  front,
  back,
  isFlipped,
  onFlip,
  dragX = 0,
  dragRotate = 0,
  isDragging = false,
}: FlipCardProps) {
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
