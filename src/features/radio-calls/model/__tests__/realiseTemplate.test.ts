import { describe, it, expect } from "vitest";
import { radioLocations } from "@/content/registry/radioLocations";
import { radioCallsigns } from "@/content/registry/radioCallsigns";
import { radioCallTemplates } from "@/content/registry/radioCallTemplates";
import { radioDrillCards } from "@/content/registry/radioDrillCards";
import {
  generateRadioDrillCards,
  realiseRadioTemplate,
} from "@/features/radio-calls/model/realiseTemplate";
import { evaluateSpokenCall } from "@/features/radio-calls/model/spokenMatch";

describe("realiseRadioTemplate", () => {
  it("substitutes slot tokens in title, prompt, and expectedText", () => {
    const controlled = radioCallTemplates.find((t) => t.templateId === "ctl-clearance-request");
    expect(controlled).toBeDefined();
    const sydney = radioLocations.find((l) => l.icao === "YSSY");
    expect(sydney).toBeDefined();
    const callsign = radioCallsigns[0]!;

    const card = realiseRadioTemplate(controlled!, sydney!, callsign, "Charlie");

    expect(card.title).toContain("Sydney");
    expect(card.airspaceClass).toBe("C");
    expect(card.challenge.prompt).toContain("Sydney Delivery");
    if (card.challenge.kind !== "spoken") throw new Error("expected spoken");
    expect(card.challenge.expectedText).toContain("Sydney Delivery");
    expect(card.challenge.expectedText).toContain(callsign.full);
    expect(card.challenge.expectedText).toContain("Charlie");
  });

  it("uses ground/delivery procedures for controlled-airspace pre-departure calls", () => {
    const clearance = radioCallTemplates.find((t) => t.templateId === "ctl-clearance-request")!;
    const taxi = radioCallTemplates.find((t) => t.templateId === "ctl-taxi-request")!;
    const sydney = radioLocations.find((l) => l.icao === "YSSY")!;
    const callsign = radioCallsigns[0]!;

    const clearanceCard = realiseRadioTemplate(clearance, sydney, callsign, "Alpha");
    const taxiCard = realiseRadioTemplate(taxi, sydney, callsign, "Bravo");

    if (clearanceCard.challenge.kind !== "spoken") throw new Error("expected spoken");
    if (taxiCard.challenge.kind !== "spoken") throw new Error("expected spoken");
    expect(clearanceCard.challenge.expectedText).toContain("Sydney Delivery");
    expect(clearanceCard.challenge.expectedText).not.toContain("Sydney Tower");
    expect(taxiCard.challenge.expectedText).toContain("Sydney Ground");
    expect(taxiCard.challenge.expectedText).toContain("POB two");
    expect(taxiCard.challenge.expectedText).toContain("IFR");
    expect(taxiCard.challenge.elements.find((el) => el.label === "POB")?.required).toBe(true);
    expect(taxiCard.challenge.elements.find((el) => el.label === "Flight rules")?.required).toBe(
      true,
    );
  });

  it("produces a deterministic id for the same inputs", () => {
    const template = radioCallTemplates[0]!;
    const loc = radioLocations.find((l) => l.airspaceClass === "C")!;
    const callsign = radioCallsigns[0]!;
    const a = realiseRadioTemplate(template, loc, callsign, "Alpha");
    const b = realiseRadioTemplate(template, loc, callsign, "Alpha");
    expect(a.drillId).toBe(b.drillId);
  });

  it("filters out element accept variants where the slot resolved to empty", () => {
    // A Class E "en-route" location has no `tower` field. Realising a
    // controlled template against it would emit "{tower}" → "" in some
    // accept lists. The realiser drops empties so the matcher never sees
    // literal empty strings.
    const template = radioCallTemplates.find((t) => t.templateId === "ctl-centre-checkin")!;
    const enRoute = radioLocations.find((l) => l.airspaceClass === "E")!;
    const card = realiseRadioTemplate(template, enRoute, radioCallsigns[0]!, "Bravo");
    if (card.challenge.kind !== "spoken") throw new Error("expected spoken");
    for (const el of card.challenge.elements) {
      for (const accept of el.accept) {
        expect(accept.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("generateRadioDrillCards", () => {
  const generated = generateRadioDrillCards({
    templates: radioCallTemplates,
    locations: radioLocations,
    callsigns: radioCallsigns,
    callsignsPerCombination: 2,
  });

  it("produces hundreds of cards", () => {
    expect(generated.length).toBeGreaterThan(200);
  });

  it("covers every airspace class present in the locations registry", () => {
    const classes = new Set(generated.map((c) => c.airspaceClass));
    const expected = new Set(radioLocations.map((l) => l.airspaceClass));
    // Every class with at least one applicable template should appear.
    const classesWithTemplates = new Set(
      radioCallTemplates.flatMap((t) => t.applicableClasses),
    );
    for (const cls of expected) {
      if (classesWithTemplates.has(cls)) {
        expect(classes.has(cls)).toBe(true);
      }
    }
  });

  it("does not collide drillIds with hand-authored cards", () => {
    const generatedIds = new Set(generated.map((c) => c.drillId));
    // Hand-authored drillIds start with `drill-`; generated start with `gen-`.
    for (const id of generatedIds) {
      expect(id.startsWith("gen-")).toBe(true);
    }
  });

  it("every generated card's expectedText matches all required elements", () => {
    // Self-validation: if a template's accept lists are wrong, the canonical
    // expectedText won't match the required elements. This is the cheapest
    // way to catch template authoring bugs.
    for (const card of generated) {
      if (card.challenge.kind !== "spoken") continue;
      const evaluation = evaluateSpokenCall(card.challenge, card.challenge.expectedText);
      if (!evaluation.isCorrect) {
        throw new Error(
          `Template "${card.drillId}" expectedText does not satisfy all required elements. ` +
            `Missing required: ${evaluation.missedRequired.map((e) => e.label).join(", ")}`,
        );
      }
    }
  });

  it("CTAF templates only generate against CTAF locations", () => {
    const ctafTemplateIds = new Set(
      radioCallTemplates.filter((t) => t.applicableClasses.includes("CTAF")).map((t) => t.templateId),
    );
    for (const card of generated) {
      const matchTemplate = [...ctafTemplateIds].some((id) => card.drillId.includes(id));
      if (matchTemplate) {
        expect(card.airspaceClass).toBe("CTAF");
      }
    }
  });

  it("controlled templates do not generate against CTAF locations", () => {
    const controlledTemplateIds = new Set(
      radioCallTemplates
        .filter((t) => !t.applicableClasses.includes("CTAF"))
        .map((t) => t.templateId),
    );
    for (const card of generated) {
      const matchTemplate = [...controlledTemplateIds].some((id) =>
        card.drillId.includes(id),
      );
      if (matchTemplate) {
        expect(card.airspaceClass).not.toBe("CTAF");
      }
    }
  });
});

describe("radioDrillCards (full library)", () => {
  it("combines authored + generated into hundreds of cards", () => {
    expect(radioDrillCards.length).toBeGreaterThan(200);
  });

  it("has no duplicate drillIds across authored + generated", () => {
    const ids = radioDrillCards.map((c) => c.drillId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
