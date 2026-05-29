import { describe, expect, it } from "vitest";
import { sections } from "@/content/registry/sections";

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
