import { describe, expect, it } from "vitest";
import {
  groupSectionsByTrack,
  SECTION_TRACKS,
} from "@/features/study/model/sectionTracks";

interface Stub {
  sectionId: string;
}

describe("groupSectionsByTrack", () => {
  it("returns tracks in declared order with their sections in declared order", () => {
    const stubs: Stub[] = [
      { sectionId: "approaches" },
      { sectionId: "cheat-sheet" },
      { sectionId: "departure" },
      { sectionId: "administrative-part61" },
    ];
    const groups = groupSectionsByTrack(stubs);
    const trackOrder = groups.map((g) => g.track.id);
    // Foundations declared first → comes first even though approaches was
    // listed first in the input.
    expect(trackOrder[0]).toBe("foundations");
    expect(trackOrder).toContain("ops");
    // Within Foundations, cheat-sheet declared before administrative-part61.
    const foundations = groups.find((g) => g.track.id === "foundations");
    expect(foundations?.sections.map((s) => s.sectionId)).toEqual([
      "cheat-sheet",
      "administrative-part61",
    ]);
  });

  it("omits tracks that have no matching sections in the input", () => {
    const stubs: Stub[] = [{ sectionId: "cheat-sheet" }];
    const groups = groupSectionsByTrack(stubs);
    expect(groups.length).toBe(1);
    expect(groups[0]?.track.id).toBe("foundations");
  });

  it("buckets unknown sections into an 'Other' track at the end", () => {
    const stubs: Stub[] = [
      { sectionId: "cheat-sheet" },
      { sectionId: "made-up-section" },
    ];
    const groups = groupSectionsByTrack(stubs);
    expect(groups.at(-1)?.track.id).toBe("other");
    expect(groups.at(-1)?.sections.map((s) => s.sectionId)).toEqual([
      "made-up-section",
    ]);
  });

  it("never includes an 'Other' track when every section is accounted for", () => {
    // Use one section from each declared track.
    const stubs: Stub[] = SECTION_TRACKS.flatMap((t) =>
      t.sectionIds[0] ? [{ sectionId: t.sectionIds[0] }] : [],
    );
    const groups = groupSectionsByTrack(stubs);
    expect(groups.some((g) => g.track.id === "other")).toBe(false);
  });

  it("returns empty for an empty input", () => {
    expect(groupSectionsByTrack([])).toEqual([]);
  });
});
