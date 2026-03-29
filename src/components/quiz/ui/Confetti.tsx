"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  intensity?: "low" | "medium" | "high";
}

export function Confetti({ trigger, intensity = "medium" }: ConfettiProps) {
  const fireConfetti = useCallback(() => {
    const particleCounts = {
      low: 50,
      medium: 100,
      high: 200,
    };

    const count = particleCounts[intensity];

    // Fire from both sides
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Multiple bursts for a richer effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.7 },
    });

    fire(0.2, {
      spread: 60,
      origin: { x: 0.5, y: 0.7 },
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.5, y: 0.7 },
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.7 },
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    });
  }, [intensity]);

  useEffect(() => {
    if (trigger) {
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  // This component doesn't render anything - it just triggers confetti
  return null;
}

// Utility function for one-off confetti bursts
export function fireConfettiBurst(
  options: {
    intensity?: "low" | "medium" | "high";
    origin?: { x: number; y: number };
  } = {}
) {
  const { intensity = "medium", origin = { x: 0.5, y: 0.5 } } = options;

  const particleCounts = {
    low: 30,
    medium: 60,
    high: 100,
  };

  confetti({
    particleCount: particleCounts[intensity],
    spread: 70,
    origin,
    startVelocity: 30,
    zIndex: 9999,
  });
}
