import source from "../../../../docs/curriculum/baseline/topics.json";

export const baselineTopics = source.topics;
export const baselineCatalog = baselineTopics.map(({ id, title, chapter, parent, source_pages }) => ({ id, title, chapter, parent, pages: source_pages }));
export type BaselineCatalogItem = typeof baselineCatalog[number];
export const sourcePdf = "/source/reference-v7-1/original.pdf";

export function findBaselineTopic(id: string) {
  return baselineTopics.find((topic) => topic.id === id);
}

export function pageLabel(pages: readonly number[]) {
  return pages.length === 1 ? `p. ${pages[0]}` : `pp. ${pages[0]}–${pages[pages.length - 1]}`;
}

// Text extraction flattens these pages' tabular or graphical content.
// Open the original page first rather than implying that flattened columns are a reliable table.
export const originalPageFirst = new Set([9, 11, 14, 18, 19, 20, 21, 22, 23, 24, 25, 33, 39, 40, 41, 47, 48, 49, 51, 52, 53, 54, 57]);
