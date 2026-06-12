import { describe, it, expect } from "vitest";
import type { Section } from "@/content/model/section";
import { radioDrillCards } from "@/content/registry/radioDrillCards";
import radioCallsSection from "@/content/data/radio-calls.json";
import {
  RADIO_GUIDE_SECTION_ID,
  getDrillLinkForModule,
  getGuideModuleForDrill,
  getGuideUrlForDrill,
} from "@/features/radio-calls/model/guideMapping";

// Phraseology theory now lives inside /radio?tab=learn instead of the
// IFR theory section list, so resolve the section locally rather than
// via the sections registry.
const RADIO_LEARN_SECTION = radioCallsSection as Section;

describe("getGuideModuleForDrill", () => {
  it("routes CTAF cards to the CTAF module regardless of phase", () => {
    const ctafCard = radioDrillCards.find((c) => c.airspaceClass === "CTAF");
    expect(ctafCard).toBeDefined();
    expect(getGuideModuleForDrill(ctafCard!).moduleId).toBe("RADIO-007");
  });

  it("routes non-normal cards to the distress / lost-comms module", () => {
    const card = radioDrillCards.find((c) => c.phase === "non-normal");
    expect(card).toBeDefined();
    expect(getGuideModuleForDrill(card!).moduleId).toBe("RADIO-008");
  });

  it("routes pre-departure cards to module 003", () => {
    const card = radioDrillCards.find(
      (c) => c.phase === "pre-departure" && c.airspaceClass !== "CTAF",
    );
    expect(card).toBeDefined();
    expect(getGuideModuleForDrill(card!).moduleId).toBe("RADIO-003");
  });

  it("routes en-route, arrival, and final to their respective modules", () => {
    const enroute = radioDrillCards.find(
      (c) => c.phase === "enroute" && c.airspaceClass !== "CTAF",
    );
    const arrival = radioDrillCards.find(
      (c) => c.phase === "arrival" && c.airspaceClass !== "CTAF",
    );
    const final = radioDrillCards.find(
      (c) => c.phase === "final" && c.airspaceClass !== "CTAF",
    );
    expect(getGuideModuleForDrill(enroute!).moduleId).toBe("RADIO-004");
    expect(getGuideModuleForDrill(arrival!).moduleId).toBe("RADIO-005");
    expect(getGuideModuleForDrill(final!).moduleId).toBe("RADIO-006");
  });
});

describe("getGuideUrlForDrill", () => {
  it("builds a /radio Learn-tab URL with the matching module param", () => {
    const card = radioDrillCards.find((c) => c.phase === "enroute" && c.airspaceClass !== "CTAF");
    expect(getGuideUrlForDrill(card!)).toBe("/radio?tab=learn&module=RADIO-004");
  });
});

describe("getDrillLinkForModule", () => {
  it("returns null for foundational modules with no matching drill filter", () => {
    expect(getDrillLinkForModule("RADIO-001")).toBeNull();
    expect(getDrillLinkForModule("RADIO-002")).toBeNull();
  });

  it("returns a phase-filtered drill URL for phase-specific modules", () => {
    expect(getDrillLinkForModule("RADIO-003")?.href).toBe("/radio?tab=drill&phase=pre-departure");
    expect(getDrillLinkForModule("RADIO-004")?.href).toBe("/radio?tab=drill&phase=enroute");
    expect(getDrillLinkForModule("RADIO-006")?.href).toBe("/radio?tab=drill&phase=final");
  });

  it("returns a class-filtered drill URL for the CTAF module", () => {
    expect(getDrillLinkForModule("RADIO-007")?.href).toBe("/radio?tab=drill&class=CTAF");
  });

  it("returns null for unknown module ids", () => {
    expect(getDrillLinkForModule("RADIO-999")).toBeNull();
  });
});

describe("guide section integrity (cross-content check)", () => {
  it("the radio-calls section JSON matches RADIO_GUIDE_SECTION_ID", () => {
    expect(RADIO_LEARN_SECTION.sectionId).toBe(RADIO_GUIDE_SECTION_ID);
  });

  it("every module id referenced by the mapping actually exists in the section", () => {
    const moduleIds = new Set(RADIO_LEARN_SECTION.modules.map((m) => m.id));
    const referencedIds = [
      "RADIO-001",
      "RADIO-002",
      "RADIO-003",
      "RADIO-004",
      "RADIO-005",
      "RADIO-006",
      "RADIO-007",
      "RADIO-008",
    ];
    for (const id of referencedIds) {
      expect(moduleIds.has(id)).toBe(true);
    }
  });

  it("every drill card resolves to a guide module that exists", () => {
    const moduleIds = new Set(RADIO_LEARN_SECTION.modules.map((m) => m.id));
    for (const card of radioDrillCards) {
      const target = getGuideModuleForDrill(card);
      expect(moduleIds.has(target.moduleId)).toBe(true);
    }
  });
});
