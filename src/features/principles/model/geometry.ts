// International nautical mile: 1852 m; international foot: 0.3048 m.
export const FEET_PER_NAUTICAL_MILE = 1852 / 0.3048;

export function normaliseBearing(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function bearingLabel(degrees: number): string {
  return `${String(Math.round(normaliseBearing(degrees)) % 360 || 360).padStart(3, "0")}°`;
}

export function climbRelationship(gradientPercent: number, groundspeedKnots: number) {
  if (!Number.isFinite(gradientPercent) || !Number.isFinite(groundspeedKnots) || gradientPercent < 0 || groundspeedKnots < 0) {
    throw new RangeError("Gradient and groundspeed must be finite non-negative numbers.");
  }
  const feetPerNauticalMile = gradientPercent / 100 * FEET_PER_NAUTICAL_MILE;
  return { feetPerNauticalMile, feetPerMinute: feetPerNauticalMile * groundspeedKnots / 60 };
}

export const VISUAL_LESSONS = [
  { id: "holding", title: "Holding geometry", summary: "Follow the pattern. Separate track from heading.", page: "38–40", section: "holding" },
  { id: "approach", title: "Approach guidance", summary: "See what changes between 2D and 3D guidance.", page: "41, 44", section: "approaches" },
  { id: "gradient", title: "Gradient & groundspeed", summary: "Connect height per mile with height per minute.", page: "57", section: "performance-gradient" },
] as const;

export type VisualLessonId = typeof VISUAL_LESSONS[number]["id"];

export function visualLessonId(value: string | null): VisualLessonId {
  return VISUAL_LESSONS.find((lesson) => lesson.id === value)?.id ?? "holding";
}
