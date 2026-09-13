import { describe, expect, it } from "vitest";
import { baselineTopics, findBaselineTopic } from "./baseline";
import { readingDocument } from "./readingDocument";
import type { ReadingItem } from "./readingDocument";
import { existsSync } from "node:fs";

function documentFor(id: string) {
  const topic = findBaselineTopic(id)!;
  const fragment = topic.fragments[0]!;
  return readingDocument(id, fragment.page, fragment.text)!;
}

describe("reviewed reading layouts", () => {
  it("provides a complete reading layout for all 51 topics without losing source tokens", () => {
    const words = (text: string) => text.trim().split(/\s+/).sort();
    const itemText = (items: ReadingItem[]): string[] => items.flatMap((item) => [item.text, ...itemText(item.children ?? [])]);
    expect(baselineTopics).toHaveLength(51);
    for (const topic of baselineTopics) for (const fragment of topic.fragments) {
      const document = readingDocument(topic.id, fragment.page, fragment.text);
      expect(document, `${topic.id} page ${fragment.page}`).toBeDefined();
      const text = [document!.title, ...document!.blocks.flatMap((block) => block.kind === "list" ? itemText(block.items) : block.kind === "table" ? [...block.headers, ...block.rows.flat()] : [block.text])].join(" ");
      expect(words(text), `${topic.id} page ${fragment.page}`).toEqual(words(fragment.text));
    }
  });
  it("retains the diagrams that cannot be recovered by text extraction", () => {
    for (const [id, page] of [["holding-entries", 39], ["approach-procedure-turns", 47], ["approach-test-tolerances", 48], ["gradient-nomograph", 57]] as const) {
      const fragment = findBaselineTopic(id)!.fragments.find((item) => item.page === page)!;
      const figures = readingDocument(id, page, fragment.text)!.blocks.filter((block) => block.kind === "figure");
      expect(figures).toHaveLength(1);
      expect(existsSync(`public${figures[0]!.image.src}`)).toBe(true);
    }
  });
  it("retains unusual statutory markers and nested list relationships", () => {
    const document = documentFor("admin-definitions");
    expect(document.title).toBe("Part 61 Definitions");
    const lists = document.blocks.filter((block) => block.kind === "list");
    expect(lists[1]!.items[0]!.children?.[3]?.text).toBe("(ca) powered-lift aircraft;");
    expect(lists[1]!.items[1]!.children?.[1]?.text).toContain("under regulation 61.050");
  });
  it("restores QNH paragraphs while keeping both source notes and the final qualification", () => {
    const document = documentFor("approach-qnh");
    expect(document.blocks.filter((block) => block.kind === "note")).toHaveLength(2);
    expect(document.blocks.at(-1)).toEqual({ kind: "paragraph", text: "Where the forecast area QNH is used, the minima used must be increased by 50FT." });
  });
  it("preserves the reviewed operation-to-code table relationships", () => {
    expect(documentFor("general-transponders").blocks[1]).toEqual({ kind: "table", headers: ["Operation", "Code"], rows: [
      ["VFR in Class E or G or OCTA", "1200"], ["IFR OCTA", "2000"], ["IFR in Class E or civil flights in CTA", "3000"],
    ] });
  });
  it("falls back to the source when new text is not covered or a topic is unreviewed", () => {
    const fragment = findBaselineTopic("approach-qnh")!.fragments[0]!;
    expect(readingDocument("approach-qnh", 42, fragment.text + "\nNew condition")).toBeUndefined();
    expect(readingDocument("approach-qnh", 43, fragment.text)).toBeUndefined();
    expect(readingDocument("holding-entries", 38, "Any source text")).toBeUndefined();
  });
});
