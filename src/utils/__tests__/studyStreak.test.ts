import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock idb-keyval via the storage module
vi.mock("@/lib/storage", () => {
  const store: Record<string, unknown> = {};
  return {
    storage: {
      get: vi.fn(async (key: string) => store[key] ?? null),
      set: vi.fn(async (key: string, value: unknown) => { store[key] = value; }),
      del: vi.fn(async (key: string) => { delete store[key]; }),
    },
  };
});

import { storage } from "@/lib/storage";
import { recordStudyActivity, getStreakData } from "../studyStreak";

function fakeToday(dateStr: string) {
  vi.setSystemTime(new Date(dateStr + "T12:00:00Z"));
}

beforeEach(() => {
  vi.useFakeTimers();
  // Clear the in-memory store between tests
  (storage.get as ReturnType<typeof vi.fn>).mockImplementation(async () => null);
  (storage.set as ReturnType<typeof vi.fn>).mockImplementation(async () => {});
});

describe("studyStreak", () => {
  describe("getStreakData", () => {
    it("returns zeros when no data stored", async () => {
      const data = await getStreakData();
      expect(data.currentStreak).toBe(0);
      expect(data.longestStreak).toBe(0);
      expect(data.lastStudyDate).toBe("");
    });
  });

  describe("recordStudyActivity", () => {
    it("starts streak at 1 on first activity", async () => {
      fakeToday("2025-01-01");
      const data = await recordStudyActivity();
      expect(data.currentStreak).toBe(1);
      expect(data.lastStudyDate).toBe("2025-01-01");
      expect(data.longestStreak).toBe(1);
    });

    it("is idempotent — calling twice on the same day does not increment", async () => {
      fakeToday("2025-01-01");
      let stored: unknown = null;
      (storage.get as ReturnType<typeof vi.fn>).mockImplementation(async () => stored);
      (storage.set as ReturnType<typeof vi.fn>).mockImplementation(async (_k: string, v: unknown) => { stored = v; });

      const first = await recordStudyActivity();
      expect(first.currentStreak).toBe(1);

      const second = await recordStudyActivity();
      expect(second.currentStreak).toBe(1); // no change
    });

    it("increments streak on consecutive days", async () => {
      let stored: unknown = null;
      (storage.get as ReturnType<typeof vi.fn>).mockImplementation(async () => stored);
      (storage.set as ReturnType<typeof vi.fn>).mockImplementation(async (_k: string, v: unknown) => { stored = v; });

      fakeToday("2025-01-01");
      await recordStudyActivity();

      fakeToday("2025-01-02");
      const day2 = await recordStudyActivity();
      expect(day2.currentStreak).toBe(2);

      fakeToday("2025-01-03");
      const day3 = await recordStudyActivity();
      expect(day3.currentStreak).toBe(3);
      expect(day3.longestStreak).toBe(3);
    });

    it("resets streak to 1 after a gap", async () => {
      let stored: unknown = null;
      (storage.get as ReturnType<typeof vi.fn>).mockImplementation(async () => stored);
      (storage.set as ReturnType<typeof vi.fn>).mockImplementation(async (_k: string, v: unknown) => { stored = v; });

      fakeToday("2025-01-01");
      await recordStudyActivity();

      fakeToday("2025-01-03"); // skip a day
      const data = await recordStudyActivity();
      expect(data.currentStreak).toBe(1);
    });

    it("preserves longestStreak across resets", async () => {
      let stored: unknown = null;
      (storage.get as ReturnType<typeof vi.fn>).mockImplementation(async () => stored);
      (storage.set as ReturnType<typeof vi.fn>).mockImplementation(async (_k: string, v: unknown) => { stored = v; });

      fakeToday("2025-01-01");
      await recordStudyActivity();
      fakeToday("2025-01-02");
      await recordStudyActivity();
      fakeToday("2025-01-03");
      await recordStudyActivity(); // streak = 3, longest = 3

      fakeToday("2025-01-10"); // big gap
      const after = await recordStudyActivity();
      expect(after.currentStreak).toBe(1);
      expect(after.longestStreak).toBe(3); // preserved
    });
  });
});
