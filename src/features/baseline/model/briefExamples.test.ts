import { describe, expect, it } from "vitest";
import { briefExamples } from "./briefExamples";
import { baselineTopics } from "./baseline";
import { operationalExampleFor, operationalExamples } from "./operationalExamples";

describe("operational examples within the baseline reader", () => {
  it("attaches each example to one existing topic without competing versions", () => {
    const all = [...briefExamples, ...operationalExamples];
    expect(new Set(all.map((item) => item.parentTopic)).size).toBe(all.length);
    for (const item of all) {
      expect(baselineTopics.some((topic) => topic.id === item.parentTopic)).toBe(true);
      expect(operationalExampleFor(item.parentTopic)).toBe(item);
    }
    expect(operationalExampleFor("missing-topic")).toBeUndefined();
  });

  it("keeps short examples readable and linked to Australian primary sources", () => {
    for (const item of briefExamples) {
      const prose = [item.situation, item.action, item.reason].join(" ");
      expect(prose.split(/\s+/).length, item.parentTopic).toBeLessThanOrEqual(150);
      expect(item.situation).toMatch(/\byou\b/i);
      const url = new URL(item.sourceUrl, "https://local.example");
      expect(["www.legislation.gov.au", "www.casa.gov.au", "www.airservicesaustralia.com", "local.example"]).toContain(url.hostname);
      if (url.hostname === "local.example") expect(url.pathname).toBe("/source/reference-v7-1/original.pdf");
    }
  });
});
