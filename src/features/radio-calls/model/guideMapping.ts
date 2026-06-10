import type {
  AirspaceClass,
  RadioDrillCard,
  RadioPhase,
} from "@/content/model/radio";

/**
 * The radio-calls study guide section id. Matches `sectionId` in
 * `src/content/data/radio-calls.json`.
 */
export const RADIO_GUIDE_SECTION_ID = "radio-calls";

/** Module id for each phase + airspace combination. */
const MODULE_FOR_PHASE: Record<RadioPhase, string> = {
  "pre-departure": "RADIO-003",
  // Departure-phase drills (e.g. SID readback) belong with pre-departure
  // — the same module covers clearance + SID + taxi + takeoff.
  departure: "RADIO-003",
  enroute: "RADIO-004",
  arrival: "RADIO-005",
  final: "RADIO-006",
  "non-normal": "RADIO-008",
};

interface ModuleTarget {
  sectionId: string;
  moduleId: string;
}

/**
 * Resolve a drill card to its matching guide module. CTAF cards route
 * to the CTAF module regardless of phase; non-normal cards route to the
 * distress / lost-comms module; everything else routes by phase.
 */
export function getGuideModuleForDrill(card: RadioDrillCard): ModuleTarget {
  const sectionId = RADIO_GUIDE_SECTION_ID;
  if (card.airspaceClass === "CTAF") return { sectionId, moduleId: "RADIO-007" };
  return { sectionId, moduleId: MODULE_FOR_PHASE[card.phase] };
}

/**
 * Build a /study deep-link to the matching guide module.
 */
export function getGuideUrlForDrill(card: RadioDrillCard): string {
  const { sectionId, moduleId } = getGuideModuleForDrill(card);
  return `/study?section=${encodeURIComponent(sectionId)}&module=${encodeURIComponent(moduleId)}`;
}

interface DrillFilter {
  phase?: RadioPhase;
  airspaceClass?: AirspaceClass;
}

/**
 * Mapping from guide module id → which drill filter best matches its content.
 * Used by the study reader to render a "Practice these calls →" CTA on
 * radio-calls modules.
 */
const DRILL_FILTER_FOR_MODULE: Record<string, DrillFilter & { label: string }> = {
  "RADIO-003": { phase: "pre-departure", label: "Practice pre-departure calls" },
  "RADIO-004": { phase: "enroute", label: "Practice en-route calls" },
  "RADIO-005": { phase: "arrival", label: "Practice arrival calls" },
  "RADIO-006": { phase: "final", label: "Practice final / missed approach calls" },
  "RADIO-007": { airspaceClass: "CTAF", label: "Practice CTAF broadcasts" },
  "RADIO-008": { phase: "non-normal", label: "Practice distress / lost-comms calls" },
};

export interface PracticeLink {
  href: string;
  label: string;
}

/**
 * Resolve a guide module id to its corresponding Drill tab deep-link, or
 * null when the module is foundational (no specific drill phase to filter).
 */
export function getDrillLinkForModule(moduleId: string): PracticeLink | null {
  const filter = DRILL_FILTER_FOR_MODULE[moduleId];
  if (!filter) return null;
  const params = new URLSearchParams({ tab: "drill" });
  if (filter.phase) params.set("phase", filter.phase);
  if (filter.airspaceClass) params.set("class", filter.airspaceClass);
  return {
    href: `/radio?${params.toString()}`,
    label: filter.label,
  };
}
