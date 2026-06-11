import { describe, expect, it } from "vitest";
import { sections } from "@/content/registry/sections";

function getModule(sectionId: string, moduleId: string) {
  const section = sections.find((candidate) => candidate.sectionId === sectionId);
  const studyModule = section?.modules.find((candidate) => candidate.id === moduleId);

  if (!studyModule) {
    throw new Error(`Missing study module ${sectionId}:${moduleId}`);
  }

  return studyModule;
}

describe("content provenance", () => {
  it("gives every study module at least one explicit reference or provenance note", () => {
    const missingRefs = sections.flatMap((section) =>
      section.modules
        .filter((module) => !Array.isArray(module.refs) || module.refs.length === 0)
        .map((module) => `${section.sectionId}:${module.id}`)
    );

    expect(missingRefs).toEqual([]);
  });
});

describe("radio phraseology content", () => {
  it("does not teach POB as the Class G/Class D taxi differentiator", () => {
    const phraseology = getModule("cheat-sheet", "CS-018");
    const taxiDifferentiatorCard = phraseology.content.find(
      (block) =>
        block.type === "qa" &&
        block.question.includes("Class G IFR taxi call") &&
        block.question.includes("Class D taxi")
    );

    expect(taxiDifferentiatorCard).toMatchObject({
      type: "qa",
      answer: expect.stringContaining("POB is not the differentiator"),
    });
  });

  it("keeps Class G taxi drills aligned with the stated aircraft-type requirement", () => {
    const classGPhraseology = getModule("airspace-atc-services", "ATC-003");
    const classGText = classGPhraseology.content
      .flatMap((block) => ("content" in block && Array.isArray(block.content) ? block.content : []))
      .join("\n");

    expect(classGText).toContain("[aircraft type]");
    expect(classGText).not.toContain("[Callsign] POB [number] IFR Taxiing");
  });
});
