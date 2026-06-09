"use client";

import { useEffect, useCallback } from "react";
import type { Options as ConfettiOptions } from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  intensity?: "low" | "medium" | "high";
}

const PARTICLE_COUNTS = { low: 50, medium: 100, high: 200 } as const;

export function Confetti({ trigger, intensity = "medium" }: ConfettiProps) {
  const fireConfetti = useCallback(async () => {
    // Respect users who have asked for less motion (vestibular sensitivities,
    // photosensitive epilepsy). Skip the celebration entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Lazy-load canvas-confetti so the ~7KB gzip lives outside the initial
    // route bundle. It's only needed at the moment of a results screen.
    const { default: confetti } = await import("canvas-confetti");

    const count = PARTICLE_COUNTS[intensity];
    const defaults: ConfettiOptions = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const fire = (particleRatio: number, opts: ConfettiOptions) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.5, y: 0.7 } });
    fire(0.2, { spread: 60, origin: { x: 0.5, y: 0.7 } });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.5, y: 0.7 } });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.5, y: 0.7 } });
    fire(0.1, { spread: 120, startVelocity: 45, origin: { x: 0.5, y: 0.7 } });
  }, [intensity]);

  useEffect(() => {
    if (trigger) {
      void fireConfetti();
    }
  }, [trigger, fireConfetti]);

  return null;
}
