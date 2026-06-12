/**
 * Sections grouped into pedagogical tracks for the section picker. Order
 * within each track matters — top-to-bottom mirrors the typical IFR study
 * progression. A section not listed in any track falls through to "Other".
 */
export interface SectionTrack {
  id: string;
  label: string;
  /** Section IDs in this track, in study order. */
  sectionIds: string[];
}

export const SECTION_TRACKS: SectionTrack[] = [
  {
    id: "foundations",
    label: "Foundations",
    sectionIds: ["cheat-sheet", "administrative-part61", "quick-fire-numbers"],
  },
  {
    id: "planning",
    label: "Pre-flight & Planning",
    sectionIds: ["fuel-alternates", "performance-gradient"],
  },
  {
    id: "ops",
    label: "Operations",
    sectionIds: [
      "departure",
      "en-route",
      "holding",
      "approaches",
      "radio-calls",
    ],
  },
  {
    id: "non-normal",
    label: "Non-normal & Traps",
    sectionIds: [
      "airspace-atc-services",
      "casa-traps",
      "miscellaneous-technical",
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    sectionIds: ["advanced-ifr-regs-airline-ops", "airline-scenarios-panel"],
  },
];

/**
 * Build the per-track section partition for a given section list. Returns
 * tracks in declared order, each containing only the sections actually
 * present in `sections`. Any section not assigned to a track is bucketed
 * into a synthetic "Other" track at the end.
 */
export function groupSectionsByTrack<T extends { sectionId: string }>(
  sections: T[],
): Array<{ track: SectionTrack; sections: T[] }> {
  const bySectionId = new Map(sections.map((s) => [s.sectionId, s]));
  const assigned = new Set<string>();
  const groups: Array<{ track: SectionTrack; sections: T[] }> = [];

  for (const track of SECTION_TRACKS) {
    const trackSections: T[] = [];
    for (const id of track.sectionIds) {
      const s = bySectionId.get(id);
      if (s) {
        trackSections.push(s);
        assigned.add(id);
      }
    }
    if (trackSections.length > 0) {
      groups.push({ track, sections: trackSections });
    }
  }

  const leftover = sections.filter((s) => !assigned.has(s.sectionId));
  if (leftover.length > 0) {
    groups.push({
      track: { id: "other", label: "Other", sectionIds: [] },
      sections: leftover,
    });
  }

  return groups;
}
