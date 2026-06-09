import { describe, it, expect } from "vitest";
import {
  evaluateSpokenCall,
  normalisePhrase,
} from "@/features/radio-calls/model/spokenMatch";
import type { RadioSpokenCall } from "@/content/model/radio";

describe("normalisePhrase", () => {
  it("lowercases and trims", () => {
    expect(normalisePhrase("  Bankstown Tower  ")).toBe("bankstown tower");
  });

  it("collapses internal whitespace", () => {
    expect(normalisePhrase("hello    world")).toBe("hello world");
  });

  it("strips punctuation", () => {
    expect(normalisePhrase("Lima, Echo, Foxtrot.")).toBe("lima echo foxtrot decimal");
    expect(normalisePhrase("Roger!")).toBe("roger");
    expect(normalisePhrase("Climb? Climb!")).toBe("climb climb");
  });

  it("treats 'decimal' / 'point' / 'dot' / '.' as the same token", () => {
    expect(normalisePhrase("one two one decimal seven")).toBe(
      "one two one decimal seven",
    );
    expect(normalisePhrase("one two one point seven")).toBe(
      "one two one decimal seven",
    );
    expect(normalisePhrase("121.7")).toBe("one two one decimal seven");
  });

  it("expands FL220 to 'flight level two two zero'", () => {
    expect(normalisePhrase("cleared FL220")).toBe(
      "cleared flight level two two zero",
    );
    expect(normalisePhrase("FL120")).toBe("flight level one two zero");
  });

  it("expands bare multi-digit numbers to digit words", () => {
    expect(normalisePhrase("squawk 4123")).toBe("squawk four one two three");
    expect(normalisePhrase("at 0408")).toBe("at zero four zero eight");
  });

  it("expands single digits to words", () => {
    expect(normalisePhrase("runway 3")).toBe("runway three");
  });

  it("collapses hyphens (PAN-PAN → PAN PAN)", () => {
    expect(normalisePhrase("PAN-PAN")).toBe("pan pan");
  });

  it("is idempotent — running twice yields the same result", () => {
    const once = normalisePhrase("Cleared FL220, squawk 4123.");
    const twice = normalisePhrase(once);
    expect(twice).toBe(once);
  });
});

const clearanceRequest: RadioSpokenCall = {
  kind: "spoken",
  id: "test-clearance",
  prompt: "Request IFR clearance.",
  expectedText:
    "Bankstown Tower, Lima Echo Foxtrot, IFR clearance to Coffs Harbour, information Mike.",
  elements: [
    {
      label: "Addressed station",
      accept: ["Bankstown Tower", "Bankstown"],
      required: true,
    },
    {
      label: "Callsign",
      accept: ["Lima Echo Foxtrot", "LEF"],
      required: true,
    },
    {
      label: "Request type",
      accept: ["IFR clearance", "instrument clearance"],
      required: true,
    },
    {
      label: "Destination",
      accept: ["Coffs Harbour", "Coffs"],
      required: true,
    },
    {
      label: "ATIS code",
      accept: ["information Mike", "Mike"],
      required: false,
    },
  ],
};

describe("evaluateSpokenCall — basic matching", () => {
  it("scores a verbatim AIP call as correct, all elements hit", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      "Bankstown Tower, Lima Echo Foxtrot, IFR clearance to Coffs Harbour, information Mike.",
    );
    expect(out.isCorrect).toBe(true);
    expect(out.hits).toHaveLength(5);
    expect(out.missedRequired).toEqual([]);
    expect(out.missedOptional).toEqual([]);
  });

  it("is case-insensitive", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      "BANKSTOWN TOWER LIMA ECHO FOXTROT IFR CLEARANCE TO COFFS HARBOUR INFORMATION MIKE",
    );
    expect(out.isCorrect).toBe(true);
  });

  it("accepts any of the configured phrasings per element", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      "Bankstown LEF instrument clearance to Coffs Mike",
    );
    expect(out.isCorrect).toBe(true);
    expect(out.hits).toHaveLength(5);
  });

  it("ignores punctuation differences", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      "bankstown tower lima echo foxtrot ifr clearance to coffs harbour information mike",
    );
    expect(out.isCorrect).toBe(true);
  });
});

describe("evaluateSpokenCall — element accounting", () => {
  it("flags a missed required element and fails the call", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      // Missing callsign.
      "Bankstown Tower, IFR clearance to Coffs Harbour, information Mike.",
    );
    expect(out.isCorrect).toBe(false);
    expect(out.missedRequired.map((e) => e.label)).toEqual(["Callsign"]);
  });

  it("flags multiple missed required elements", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      // Missing addressed station + callsign.
      "IFR clearance to Coffs Harbour, information Mike.",
    );
    expect(out.isCorrect).toBe(false);
    expect(out.missedRequired.map((e) => e.label).sort()).toEqual(
      ["Addressed station", "Callsign"].sort(),
    );
  });

  it("missing optional element does not fail the call", () => {
    const out = evaluateSpokenCall(
      clearanceRequest,
      // Missing ATIS code (optional).
      "Bankstown Tower, Lima Echo Foxtrot, IFR clearance to Coffs Harbour.",
    );
    expect(out.isCorrect).toBe(true);
    expect(out.missedRequired).toEqual([]);
    expect(out.missedOptional.map((e) => e.label)).toEqual(["ATIS code"]);
  });

  it("empty transcript misses every required element", () => {
    const out = evaluateSpokenCall(clearanceRequest, "");
    expect(out.isCorrect).toBe(false);
    expect(out.missedRequired).toHaveLength(4);
    expect(out.hits).toEqual([]);
  });
});

describe("evaluateSpokenCall — aviation normalisation in action", () => {
  const climbReadback: RadioSpokenCall = {
    kind: "spoken",
    id: "test-climb",
    prompt: "Read back the climb.",
    expectedText: "Climb seven thousand, squawk four one two three, Lima Echo Foxtrot.",
    elements: [
      {
        label: "Climb",
        accept: ["climb seven thousand", "climbing seven thousand", "seven thousand"],
        required: true,
      },
      {
        label: "Squawk",
        accept: ["squawk four one two three", "squawk 4123"],
        required: true,
      },
      {
        label: "Callsign",
        accept: ["Lima Echo Foxtrot"],
        required: true,
      },
    ],
  };

  it("matches squawk spoken as digits or words", () => {
    const words = evaluateSpokenCall(
      climbReadback,
      "climb seven thousand, squawk four one two three, Lima Echo Foxtrot",
    );
    expect(words.isCorrect).toBe(true);

    const digits = evaluateSpokenCall(
      climbReadback,
      "climb seven thousand, squawk 4123, Lima Echo Foxtrot",
    );
    expect(digits.isCorrect).toBe(true);
  });

  it("matches 'climb' / 'climbing' / bare altitude as the same element", () => {
    expect(
      evaluateSpokenCall(climbReadback, "climbing seven thousand, squawk 4123, Lima Echo Foxtrot")
        .isCorrect,
    ).toBe(true);
    expect(
      evaluateSpokenCall(climbReadback, "seven thousand, squawk 4123, Lima Echo Foxtrot")
        .isCorrect,
    ).toBe(true);
  });

  it("matches frequency spoken as 'decimal' or with '.'", () => {
    const freq: RadioSpokenCall = {
      kind: "spoken",
      id: "f",
      prompt: "Acknowledge.",
      expectedText: "one two five decimal one, MXG",
      elements: [
        { label: "Frequency", accept: ["one two five decimal one", "125.1"], required: true },
        { label: "Callsign", accept: ["MXG"], required: true },
      ],
    };
    expect(evaluateSpokenCall(freq, "one two five point one, MXG").isCorrect).toBe(true);
    expect(evaluateSpokenCall(freq, "125.1 MXG").isCorrect).toBe(true);
    expect(evaluateSpokenCall(freq, "one two five decimal one MXG").isCorrect).toBe(true);
  });
});
