import { describe, expect, it } from "vitest";
import { bearingLabel, climbRelationship, visualLessonId } from "./geometry";

describe("visual workbook geometry", () => {
  it("labels north consistently and wraps reciprocal tracks", () => {
    expect(bearingLabel(0)).toBe("360°");
    expect(bearingLabel(360)).toBe("360°");
    expect(bearingLabel(350 + 180)).toBe("170°");
    expect(bearingLabel(-10)).toBe("350°");
  });
  it("converts a 5% gradient at 120 kt to approximately 608 ft/min", () => {
    const result = climbRelationship(5, 120);
    expect(result.feetPerNauticalMile).toBeCloseTo(303.806, 2);
    expect(result.feetPerMinute).toBeCloseTo(607.612, 2);
    expect(climbRelationship(5, 240).feetPerMinute).toBe(result.feetPerMinute * 2);
  });
  it("handles zero and rejects non-physical inputs", () => {
    expect(climbRelationship(0, 120).feetPerMinute).toBe(0);
    expect(climbRelationship(5, 0).feetPerMinute).toBe(0);
    for (const value of [-1, NaN, Infinity]) {
      expect(() => climbRelationship(value, 120)).toThrow(RangeError);
      expect(() => climbRelationship(5, value)).toThrow(RangeError);
    }
  });
  it("opens a valid lesson for unknown or missing URL values", () => {
    expect(visualLessonId(null)).toBe("holding");
    expect(visualLessonId("unknown")).toBe("holding");
    expect(visualLessonId("gradient")).toBe("gradient");
  });
});
