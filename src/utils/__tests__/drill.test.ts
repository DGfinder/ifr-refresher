import { describe, it, expect } from "vitest";
import { buildDrillQuestions } from "../drill";
import type { Section } from "@/types/section";

// ─── Minimal test fixtures ────────────────────────────────────────────────────

const makeSection = (overrides: Partial<Section> = {}): Section => ({
  version: "1.0",
  sectionId: "test-section",
  sectionTitle: "Test Section",
  sectionDescription: "Test",
  categories: [{ id: "cat-1", title: "Cat 1", description: "", moduleIds: ["mod-1"] }],
  modules: [
    {
      id: "mod-1",
      title: "Module 1",
      categoryId: "cat-1",
      level: "core",
      estReadingMinutes: 1,
      tags: ["test"],
      summary: "Test module",
      content: [
        { type: "qa", question: "What is A?", answer: "Answer A" },
        { type: "qa", question: "What is B?", answer: "Answer B" },
      ],
      refs: [],
    },
  ],
  ...overrides,
});

// ─── buildDrillQuestions ──────────────────────────────────────────────────────

describe("buildDrillQuestions", () => {
  it("returns empty array for empty sections", () => {
    expect(buildDrillQuestions([])).toEqual([]);
  });

  it("extracts qa blocks with kind=legacy_qa", () => {
    const questions = buildDrillQuestions([makeSection()]);
    expect(questions).toHaveLength(2);
    expect(questions[0].kind).toBe("legacy_qa");
    expect(questions[1].kind).toBe("legacy_qa");
  });

  it("builds unique IDs using sectionId:moduleId:kind-index", () => {
    const questions = buildDrillQuestions([makeSection()]);
    expect(questions[0].id).toBe("test-section:mod-1:legacy_qa-0");
    expect(questions[1].id).toBe("test-section:mod-1:legacy_qa-1");
  });

  it("populates prompt and answer from qa block", () => {
    const questions = buildDrillQuestions([makeSection()]);
    expect(questions[0].prompt).toBe("What is A?");
    expect(questions[0].answer).toBe("Answer A");
  });

  it("passes through distractors when exactly 3 provided", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "qa",
        question: "Q?",
        answer: "Correct",
        distractors: ["Wrong 1", "Wrong 2", "Wrong 3"],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].distractors).toEqual(["Wrong 1", "Wrong 2", "Wrong 3"]);
  });

  it("does NOT pass through distractors when fewer than 3 provided", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "qa",
        question: "Q?",
        answer: "Correct",
        distractors: ["Wrong 1", "Wrong 2"],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].distractors).toBeUndefined();
  });

  it("extracts ipc_questions with kind=ipc", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "ipc_questions",
        content: [
          "Q: What is the holding speed below FL140? A: 230 KIAS.",
          "Q: What is VYSE? A: Single engine best rate of climb speed.",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(2);
    expect(questions[0].kind).toBe("ipc");
    expect(questions[0].prompt).toBe("What is the holding speed below FL140?");
    expect(questions[0].answer).toBe("230 KIAS.");
  });

  it("skips malformed Q/A strings in ipc_questions", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "ipc_questions",
        content: [
          "Q: Valid question? A: Valid answer.",
          "This is not a valid QA string",
          "Q: Another valid? A: Also valid.",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(2);
  });

  it("extracts airline_questions with kind=airline", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "airline_questions",
        content: ["Q: Define ETOPS. A: Extended operations beyond 60 minutes from an alternate."],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].kind).toBe("airline");
  });

  it("handles multiple sections without ID collisions", () => {
    const s1 = makeSection({ sectionId: "section-a", sectionTitle: "A" });
    const s2 = makeSection({ sectionId: "section-b", sectionTitle: "B" });
    const questions = buildDrillQuestions([s1, s2]);
    const ids = questions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("attaches section metadata to each question", () => {
    const questions = buildDrillQuestions([makeSection()]);
    expect(questions[0].sectionId).toBe("test-section");
    expect(questions[0].sectionTitle).toBe("Test Section");
    expect(questions[0].moduleId).toBe("mod-1");
    expect(questions[0].moduleTitle).toBe("Module 1");
    expect(questions[0].level).toBe("core");
  });

  it("ignores non-question block types without throwing", () => {
    const section = makeSection();
    section.modules[0].content = [
      { type: "text", text: "Some intro text" },
      { type: "qa", question: "Q?", answer: "A." },
      { type: "heading", level: 2, text: "Heading" },
      { type: "list", style: "bullet", items: ["item 1"] },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(1);
  });

  // ─── traps blocks ──────────────────────────────────────────────────────────

  it("extracts traps blocks with kind=trap", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "traps",
        content: [
          "Using METAR QNH as 'actual' — METAR is observation, not an approved source.",
          "Descending below MDA without visual reference — MDA is a hard floor, not a descent point.",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(2);
    expect(questions[0].kind).toBe("trap");
    expect(questions[1].kind).toBe("trap");
  });

  it("formats trap prompt as 'What's the trap: [front]?'", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "traps",
        content: ["Using METAR QNH as 'actual' — METAR is observation, not an approved source."],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].prompt).toBe("What's the trap: Using METAR QNH as 'actual'?");
    expect(questions[0].answer).toBe("METAR is observation, not an approved source.");
  });

  it("skips trap items without em dash separator", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "traps",
        content: [
          "This item has no dash and should be skipped",
          "Valid item — with a dash separator.",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(1);
    expect(questions[0].prompt).toBe("What's the trap: Valid item?");
  });

  it("assigns stable IDs to trap questions", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "traps",
        content: [
          "Trap A — explanation A.",
          "Trap B — explanation B.",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].id).toBe("test-section:mod-1:trap-0");
    expect(questions[1].id).toBe("test-section:mod-1:trap-1");
  });

  // ─── numbers blocks ────────────────────────────────────────────────────────

  it("extracts numbers blocks with kind=numeric", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "numbers",
        content: [
          "100FT — reduction in minima when actual QNH replaces TAF QNH",
          "30MIN — VFR fuel reserve after reaching destination",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(2);
    expect(questions[0].kind).toBe("numeric");
    expect(questions[1].kind).toBe("numeric");
  });

  it("uses front as prompt and back as answer for numeric items", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "numbers",
        content: ["100FT — reduction in minima when actual QNH replaces TAF QNH"],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].prompt).toBe("100FT");
    expect(questions[0].answer).toBe("reduction in minima when actual QNH replaces TAF QNH");
  });

  it("skips numeric items without em dash separator", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "numbers",
        content: [
          "This item has no separator and should be skipped",
          "45MIN — IFR fuel reserve after reaching destination",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions).toHaveLength(1);
    expect(questions[0].kind).toBe("numeric");
  });

  it("assigns stable IDs to numeric questions", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "numbers",
        content: [
          "100FT — first value",
          "200FT — second value",
        ],
      },
    ];
    const questions = buildDrillQuestions([section]);
    expect(questions[0].id).toBe("test-section:mod-1:numeric-0");
    expect(questions[1].id).toBe("test-section:mod-1:numeric-1");
  });

  it("correctly counts separate kind indexes for trap and numeric in same module", () => {
    const section = makeSection();
    section.modules[0].content = [
      {
        type: "traps",
        content: ["Trap A — explanation A.", "Trap B — explanation B."],
      },
      {
        type: "numbers",
        content: ["100FT — value 1", "200FT — value 2"],
      },
    ];
    const questions = buildDrillQuestions([section]);
    const traps = questions.filter((q) => q.kind === "trap");
    const numerics = questions.filter((q) => q.kind === "numeric");
    expect(traps).toHaveLength(2);
    expect(numerics).toHaveLength(2);
    expect(traps[0].id).toBe("test-section:mod-1:trap-0");
    expect(traps[1].id).toBe("test-section:mod-1:trap-1");
    expect(numerics[0].id).toBe("test-section:mod-1:numeric-0");
    expect(numerics[1].id).toBe("test-section:mod-1:numeric-1");
  });
});
