import type { RadioDrillCard, SpokenCallElement } from "@/content/model/radio";
import type { Reference } from "@/content/model/section";
import type { RadioCallsign } from "@/content/registry/radioCallsigns";
import type { RadioLocation } from "@/content/registry/radioLocations";
import type {
  RadioCallElementTemplate,
  RadioCallTemplate,
} from "@/content/model/radioTemplate";

/**
 * Realise one `RadioCallTemplate` against a `(location, callsign, atisCode)`
 * tuple, producing a fully-formed `RadioDrillCard`. Deterministic — the same
 * inputs always produce the same card (including the drillId), so the
 * generated card set is stable across builds.
 */
export function realiseRadioTemplate(
  template: RadioCallTemplate,
  location: RadioLocation,
  callsign: RadioCallsign,
  atisCode: string,
): RadioDrillCard {
  const slots = buildSlots(template, location, callsign, atisCode);
  const drillId = `gen-${template.templateId}-${location.icao.toLowerCase()}-${callsign.short.toLowerCase()}`;
  const challengeId = `q-${template.templateId}-${location.icao.toLowerCase()}-${callsign.short.toLowerCase()}`;

  const briefing: RadioDrillCard["briefing"] = {
    callsign: callsign.full,
    aircraftType: callsign.aircraftType,
    flightRules: "IFR",
    summary: fill(template.summaryTemplate, slots),
  };
  if (!location.icao.startsWith("ENR-")) {
    briefing.departure = location.icao;
  }
  if (template.lastTransmissionTemplate) {
    const lt: NonNullable<RadioDrillCard["briefing"]["lastTransmission"]> = {
      speaker: template.lastTransmissionTemplate.speaker,
      text: fill(template.lastTransmissionTemplate.textTemplate, slots),
    };
    if (template.lastTransmissionTemplate.station) {
      lt.station = template.lastTransmissionTemplate.station;
    }
    briefing.lastTransmission = lt;
  }

  const challenge: RadioDrillCard["challenge"] = {
    kind: "spoken",
    id: challengeId,
    prompt: fill(template.prompt, slots),
    expectedText: fill(template.expectedTextTemplate, slots),
    elements: template.elements.map((el) => realiseElement(el, slots)),
  };
  if (template.explanation) {
    challenge.explanation = fill(template.explanation, slots);
  }

  const card: RadioDrillCard = {
    version: "1.0",
    drillId,
    phase: template.phase,
    airspaceClass: location.airspaceClass,
    title: fill(template.title, slots),
    briefing,
    challenge,
    refs: template.refs.map(cloneRef),
  };
  if (template.tags) {
    card.tags = [...template.tags];
  }
  return card;
}

function realiseElement(
  el: RadioCallElementTemplate,
  slots: Readonly<Record<string, string>>,
): SpokenCallElement {
  const seen = new Set<string>();
  const accept: string[] = [];
  for (const t of el.acceptTemplates) {
    const filled = fill(t, slots);
    // Skip slots that resolved to empty strings (e.g., a location with no
    // tower won't emit a "Tower" accept variant).
    if (!filled || seen.has(filled)) continue;
    seen.add(filled);
    accept.push(filled);
  }
  const out: SpokenCallElement = {
    label: el.label,
    accept,
    required: el.required,
  };
  if (el.hint) out.hint = el.hint;
  return out;
}

function cloneRef(ref: Reference): Reference {
  // Shallow clone to drop the readonly-marker that the registry attaches.
  return { ...ref };
}

function buildSlots(
  template: RadioCallTemplate,
  location: RadioLocation,
  callsign: RadioCallsign,
  atisCode: string,
): Record<string, string> {
  // ATC unit fallbacks reflect how Australian regional aerodromes are
  // actually staffed: small Class D fields run all ground operations
  // through Tower, and outside major capital airports there's no
  // separate Delivery — clearance comes from Ground or Tower.
  const tower = location.tower ?? "";
  const ground = location.ground ?? tower;
  const delivery = location.delivery ?? ground;
  const approach = location.approach ?? location.centre ?? "";
  const departure = location.departure ?? approach;

  const slots: Record<string, string> = {
    icao: location.icao,
    city: location.city,
    shortName: location.shortName,
    tower,
    ground,
    delivery,
    approach,
    departure,
    centre: location.centre ?? "",
    ctaf: location.ctaf ?? "",
    runway: location.runway,
    runwayNumeric: location.runwayNumeric,
    callsign: callsign.full,
    callsignShort: callsign.short,
    aircraftType: callsign.aircraftType,
    atisCode,
  };
  if (template.fixedSlots) {
    for (const [k, v] of Object.entries(template.fixedSlots)) {
      slots[k] = v;
    }
  }
  return slots;
}

/**
 * Replace `{slot}` tokens. Unresolved tokens become empty strings — the
 * caller filters them out (so a CTAF location with no `tower` doesn't
 * emit a literal `{tower}` in the expected text).
 */
function fill(template: string, slots: Readonly<Record<string, string>>): string {
  return template
    .replace(/\{(\w+)\}/g, (_match, key: string) => slots[key] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Apply every applicable template to every applicable location across the
 * supplied callsign pool. Each (template, location) pair uses a
 * deterministic subset of the callsign pool (first N), and the ATIS code
 * cycles through A–Z so different cards get different codes.
 */
export function generateRadioDrillCards(input: {
  templates: readonly RadioCallTemplate[];
  locations: readonly RadioLocation[];
  callsigns: readonly RadioCallsign[];
  /** How many callsign variants to emit per (template, location). */
  callsignsPerCombination?: number;
}): RadioDrillCard[] {
  const callsignsPerCombination = input.callsignsPerCombination ?? 2;
  const cards: RadioDrillCard[] = [];
  let atisIndex = 0;

  for (const template of input.templates) {
    for (const location of input.locations) {
      if (!template.applicableClasses.includes(location.airspaceClass)) continue;
      for (let i = 0; i < Math.min(callsignsPerCombination, input.callsigns.length); i++) {
        const callsign = input.callsigns[i]!;
        const atisCode = atisLetter(atisIndex++);
        cards.push(realiseRadioTemplate(template, location, callsign, atisCode));
      }
    }
  }

  return cards;
}

function atisLetter(index: number): string {
  const letters = [
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
    "Golf",
    "Hotel",
    "India",
    "Juliet",
    "Kilo",
    "Lima",
    "Mike",
    "November",
    "Oscar",
    "Papa",
    "Quebec",
    "Romeo",
    "Sierra",
    "Tango",
    "Uniform",
    "Victor",
    "Whiskey",
    "X-ray",
    "Yankee",
    "Zulu",
  ];
  return letters[index % letters.length]!;
}
