import { describe, it, expect } from "vitest";
import {
  getStreakMultiplier,
  getTimeBonus,
  calculatePoints,
  calculatePercentage,
  getScoreFeedback,
  isStreakMilestone,
  formatTime,
  formatDuration,
} from "../quizScoring";

// ─── getStreakMultiplier ───────────────────────────────────────────────────────

describe("getStreakMultiplier", () => {
  it("returns 1x for streak 0", () => {
    expect(getStreakMultiplier(0)).toBe(1);
  });

  it("returns 1x for streak 1 and 2", () => {
    expect(getStreakMultiplier(1)).toBe(1);
    expect(getStreakMultiplier(2)).toBe(1);
  });

  it("returns 2x for streak 3", () => {
    expect(getStreakMultiplier(3)).toBe(2);
  });

  it("returns 2x for streak 4", () => {
    expect(getStreakMultiplier(4)).toBe(2);
  });

  it("returns 3x for streak 5", () => {
    expect(getStreakMultiplier(5)).toBe(3);
  });

  it("returns 3x for streak 6-9", () => {
    expect(getStreakMultiplier(6)).toBe(3);
    expect(getStreakMultiplier(9)).toBe(3);
  });

  it("returns 4x for streak 10+", () => {
    expect(getStreakMultiplier(10)).toBe(4);
    expect(getStreakMultiplier(20)).toBe(4);
    expect(getStreakMultiplier(50)).toBe(4);
  });
});

// ─── getTimeBonus ─────────────────────────────────────────────────────────────

describe("getTimeBonus", () => {
  it("returns 50 for < 5 seconds", () => {
    expect(getTimeBonus(0)).toBe(50);
    expect(getTimeBonus(4999)).toBe(50);
  });

  it("returns 25 for 5-9 seconds", () => {
    expect(getTimeBonus(5000)).toBe(25);
    expect(getTimeBonus(9999)).toBe(25);
  });

  it("returns 10 for 10-19 seconds", () => {
    expect(getTimeBonus(10000)).toBe(10);
    expect(getTimeBonus(19999)).toBe(10);
  });

  it("returns 0 for 20+ seconds", () => {
    expect(getTimeBonus(20000)).toBe(0);
    expect(getTimeBonus(60000)).toBe(0);
  });
});

// ─── calculatePoints ──────────────────────────────────────────────────────────

describe("calculatePoints", () => {
  it("returns 0 for incorrect answer", () => {
    expect(calculatePoints({ isCorrect: false, streak: 10, timeSpentMs: 1000, mode: "timed" })).toBe(0);
  });

  it("returns base 100 points for correct answer with no streak in classic mode", () => {
    expect(calculatePoints({ isCorrect: true, streak: 0, timeSpentMs: 30000, mode: "classic" })).toBe(100);
  });

  it("applies 2x multiplier at streak 3", () => {
    expect(calculatePoints({ isCorrect: true, streak: 3, timeSpentMs: 30000, mode: "classic" })).toBe(200);
  });

  it("applies 3x multiplier at streak 5", () => {
    expect(calculatePoints({ isCorrect: true, streak: 5, timeSpentMs: 30000, mode: "classic" })).toBe(300);
  });

  it("applies 4x multiplier at streak 10", () => {
    expect(calculatePoints({ isCorrect: true, streak: 10, timeSpentMs: 30000, mode: "classic" })).toBe(400);
  });

  it("adds time bonus in timed mode for fast answer", () => {
    // base 100 * 1x streak + 50 time bonus
    expect(calculatePoints({ isCorrect: true, streak: 0, timeSpentMs: 3000, mode: "timed" })).toBe(150);
  });

  it("does NOT add time bonus in classic mode", () => {
    expect(calculatePoints({ isCorrect: true, streak: 0, timeSpentMs: 3000, mode: "classic" })).toBe(100);
  });

  it("applies 2x challenge multiplier on top of base", () => {
    // base 100 * 1x streak * 2x challenge = 200
    expect(calculatePoints({ isCorrect: true, streak: 0, timeSpentMs: 30000, mode: "challenge" })).toBe(200);
  });

  it("challenge + streak stacks correctly (streak 3)", () => {
    // base 100 * 2x streak * 2x challenge = 400
    expect(calculatePoints({ isCorrect: true, streak: 3, timeSpentMs: 30000, mode: "challenge" })).toBe(400);
  });
});

// ─── calculatePercentage ──────────────────────────────────────────────────────

describe("calculatePercentage", () => {
  it("returns 0 for 0/0", () => {
    expect(calculatePercentage(0, 0)).toBe(0);
  });

  it("returns 100 for all correct", () => {
    expect(calculatePercentage(10, 10)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(calculatePercentage(1, 3)).toBe(33); // 33.33 -> 33
    expect(calculatePercentage(2, 3)).toBe(67); // 66.66 -> 67
  });

  it("returns correct percentage", () => {
    expect(calculatePercentage(8, 10)).toBe(80);
  });
});

// ─── getScoreFeedback ─────────────────────────────────────────────────────────

describe("getScoreFeedback", () => {
  it("returns excellent for 90+", () => {
    expect(getScoreFeedback(90).variant).toBe("excellent");
    expect(getScoreFeedback(100).variant).toBe("excellent");
    expect(getScoreFeedback(90).emoji).toBe("🌟");
  });

  it("returns great for 80-89", () => {
    expect(getScoreFeedback(80).variant).toBe("great");
    expect(getScoreFeedback(89).variant).toBe("great");
  });

  it("returns good for 70-79", () => {
    expect(getScoreFeedback(70).variant).toBe("good");
    expect(getScoreFeedback(79).variant).toBe("good");
  });

  it("returns needsWork for < 70", () => {
    expect(getScoreFeedback(69).variant).toBe("needsWork");
    expect(getScoreFeedback(0).variant).toBe("needsWork");
    expect(getScoreFeedback(0).emoji).toBe("📚");
  });
});

// ─── isStreakMilestone ────────────────────────────────────────────────────────

describe("isStreakMilestone", () => {
  it("returns true for milestones 3, 5, 10, 15, 20", () => {
    expect(isStreakMilestone(3)).toBe(true);
    expect(isStreakMilestone(5)).toBe(true);
    expect(isStreakMilestone(10)).toBe(true);
    expect(isStreakMilestone(15)).toBe(true);
    expect(isStreakMilestone(20)).toBe(true);
  });

  it("returns false for non-milestones", () => {
    expect(isStreakMilestone(1)).toBe(false);
    expect(isStreakMilestone(2)).toBe(false);
    expect(isStreakMilestone(4)).toBe(false);
    expect(isStreakMilestone(6)).toBe(false);
    expect(isStreakMilestone(11)).toBe(false);
  });
});

// ─── formatTime ───────────────────────────────────────────────────────────────

describe("formatTime", () => {
  it("formats 0 seconds as 0:00", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats 65 seconds as 1:05", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("formats 90 seconds as 1:30", () => {
    expect(formatTime(90)).toBe("1:30");
  });

  it("formats 3600 seconds as 60:00", () => {
    expect(formatTime(3600)).toBe("60:00");
  });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats < 60 seconds as Xs", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(59000)).toBe("59s");
  });

  it("formats exact minutes without seconds", () => {
    expect(formatDuration(120000)).toBe("2m");
  });

  it("formats minutes with seconds", () => {
    expect(formatDuration(90000)).toBe("1m 30s");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(3660000)).toBe("1h 1m");
  });
});
