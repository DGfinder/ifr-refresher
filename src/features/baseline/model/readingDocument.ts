import reviewedPlans from "./reviewedPlans.json";
import figureAssets from "./figureAssets.json";

type TextBlock = { kind: "paragraph" | "reference" | "note" | "heading" | "call"; text: string };
export type ReadingItem = { text: string; children?: ReadingItem[] };
type ListBlock = { kind: "list"; items: ReadingItem[] };
type TableBlock = { kind: "table"; headers: string[]; rows: string[][]; sharedRows?: number[] };
type FigureBlock = { kind: "figure"; text: string; page: number; image: { src: string; width: number; height: number } };
export type ReadingDocument = { title: string; blocks: (TextBlock | ListBlock | TableBlock | FigureBlock)[] };

// Reviewed against source pages 6, 18 and 42. Ranges are inclusive source lines.
// This is a presentation map, never an automatic interpretation of arbitrary PDF text.
type Range = readonly [number, number];
type ItemPlan = Range | { range: Range; children: ItemPlan[] };
type Plan = { kind: TextBlock["kind"] | "figure"; range: Range } | { kind: "list"; items: ItemPlan[] } | { kind: "table"; range: Range; headers?: string[]; rows?: string[][]; sharedRows?: number[] };
type ReviewedPlan = { topicId: string; page: number; titleRange: Range | null; blocks: Plan[] };
const plans: Record<string, { page: number; blocks: Plan[] }> = {
  "admin-definitions": { page: 6, blocks: [
    { kind: "reference", range: [1, 1] }, { kind: "paragraph", range: [2, 2] },
    { kind: "list", items: [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7]] },
    { kind: "reference", range: [8, 8] },
    { kind: "list", items: [
      { range: [9, 9], children: [[10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15]] },
      { range: [16, 16], children: [[17, 17], [18, 20]] },
    ] },
  ] },
  "approach-qnh": { page: 42, blocks: [
    { kind: "reference", range: [1, 3] }, { kind: "paragraph", range: [4, 4] },
    { kind: "list", items: [[5, 5], [6, 6], [7, 7]] },
    { kind: "paragraph", range: [8, 14] }, { kind: "paragraph", range: [15, 18] },
    { kind: "note", range: [19, 19] }, { kind: "paragraph", range: [20, 22] },
    { kind: "note", range: [23, 23] }, { kind: "paragraph", range: [24, 25] },
  ] },
  "general-transponders": { page: 18, blocks: [
    { kind: "reference", range: [1, 2] }, { kind: "table", range: [3, 6] },
  ] },
};

const compact = (text: string) => text.replace(/\s+/g, " ").trim();

/** Returns a reviewed reading layout, or leaves an unreviewed topic on its source view. */
export function readingDocument(topicId: string, page: number, text: string): ReadingDocument | undefined {
  const reviewed = (reviewedPlans as unknown as ReviewedPlan[]).find((item) => item.topicId === topicId && item.page === page);
  const plan = reviewed ?? plans[topicId];
  if (!plan || plan.page !== page) return;
  const lines = text.split("\n");
  const rangeText = ([start, end]: Range) => compact(lines.slice(start, end + 1).join(" "));
  const itemFor = (item: ItemPlan): ReadingItem => "range" in item ? { text: rangeText(item.range), children: item.children.map(itemFor) } : { text: rangeText(item) };
  const titleRange = reviewed ? reviewed.titleRange : [0, 0] as const;
  const covered: number[] = [];
  const cover = ([start, end]: Range) => { for (let i = start; i <= end; i++) covered.push(i); };
  const coverItem = (item: ItemPlan) => { if ("range" in item) { cover(item.range); item.children.forEach(coverItem); } else cover(item); };
  if (titleRange) cover(titleRange);
  plan.blocks.forEach((block) => block.kind === "list" ? block.items.forEach(coverItem) : cover(block.range));
  // Every source line must be mapped exactly once; blank furniture is harmless.
  if (new Set(covered).size !== covered.length || covered.some((line, index) => line < 0 || line >= lines.length || (index > 0 && line < covered[index - 1]!)) || lines.some((line, index) => line.trim() && !covered.includes(index))) return;
  let validTables = true;
  const blocks: ReadingDocument["blocks"] = plan.blocks.map((block) => {
    if (block.kind === "list") return { kind: "list", items: block.items.map(itemFor) };
    if (block.kind === "figure") return { kind: "figure", text: rangeText(block.range), page, image: figureAssets[`${topicId}:${page}` as keyof typeof figureAssets] ?? { src: `/source/reference-v7-1/page-${page}.webp`, width: 1012, height: 1432 } };
    if (block.kind === "table") {
      if (block.rows && block.headers) {
        // PDF extraction may read columns first. Validate all tokens when restoring row order.
        const tokens = (value: string) => compact(value).split(" ").sort().join(" ");
        if (tokens([...block.headers, ...block.rows.flat()].join(" ")) !== tokens(rangeText(block.range))) validTables = false;
        return { kind: "table", headers: block.headers, rows: block.rows, ...(block.sharedRows ? { sharedRows: block.sharedRows } : {}) };
      }
      const tableLines = lines.slice(block.range[0], block.range[1] + 1).map(compact);
      // This reviewed two-column table places each four-digit code at the row end.
      return { kind: "table", headers: (tableLines[0] ?? "").split(" "), rows: tableLines.slice(1).map((line) => {
        const split = line.lastIndexOf(" ");
        return [line.slice(0, split), line.slice(split + 1)];
      }) };
    }
    return { kind: block.kind, text: block.kind === "call" ? lines.slice(block.range[0], block.range[1] + 1).map((line) => line.trim()).join("\n") : rangeText(block.range) };
  });
  const result = { title: titleRange ? rangeText(titleRange) : "", blocks };
  // A changed source must never silently lose words through an outdated layout map.
  const itemText = (items: ReadingItem[]): string[] => items.flatMap((item) => [item.text, ...itemText(item.children ?? [])]);
  const rendered = [result.title, ...blocks.flatMap((block) => block.kind === "list" ? itemText(block.items) : block.kind === "table" ? [...block.headers, ...block.rows.flat()] : [block.text])].join(" ");
  // Reviewed tables may restore row order; line coverage and table token checks above
  // preserve source content while the pilot still enforces its original exact sequence.
  if (!validTables || (!reviewed && compact(rendered) !== compact(text))) return;
  return result;
}
