import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import capture from "../../../../docs/curriculum/baseline/source-pages.json";
import { baselineTopics, findBaselineTopic, originalPageFirst } from "./baseline";

describe("baseline reader source integrity", () => {
  it("serves only exact fragments of the captured source", () => {
    expect(baselineTopics).toHaveLength(51);
    expect(new Set(baselineTopics.map((topic) => topic.id)).size).toBe(51);
    for (const topic of baselineTopics) {
      for (const fragment of topic.fragments) {
        const page = capture.pages.find((item) => item.page === fragment.page)!;
        expect(fragment.text).toBe(page.text.slice(fragment.start_char, fragment.end_char));
      }
    }
  });

  it("keeps the alternates continuation on page 29 before special minima", () => {
    const triggers = findBaselineTopic("alternates-triggers")!;
    const special = findBaselineTopic("alternates-special-minima")!;
    const end = triggers.fragments.at(-1)!;
    expect(end.page).toBe(29);
    expect(end.text).toContain("Storms");
    expect(end.end_char).toBe(special.fragments[0]!.start_char);
  });

  it("ships the unchanged PDF and every referenced original page", () => {
    const pdf = readFileSync(resolve("public/source/reference-v7-1/original.pdf"));
    expect(createHash("sha256").update(pdf).digest("hex")).toBe(capture.sha256);
    for (let page = 1; page <= 58; page++) {
      expect(existsSync(resolve(`public/source/reference-v7-1/page-${page}.webp`))).toBe(true);
    }
    expect(originalPageFirst.has(39)).toBe(true);
    expect(originalPageFirst.has(57)).toBe(true);
  });

  it("does not resolve unknown or legacy authored module IDs as baseline topics", () => {
    expect(findBaselineTopic("unknown")).toBeUndefined();
    expect(findBaselineTopic("CS-011")).toBeUndefined();
  });
});
