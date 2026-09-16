#!/usr/bin/env node
/**
 * Segment the CASA radiotelephony manual into radio topics.
 *
 * The study baseline is a 2024 cheat sheet whose phraseology coverage is three
 * pages of example calls. The radio section is built from CASA Multi-Part
 * AC 64.B-02 / AC 91-35 / AC 172-05 instead — current to December 2025, and it
 * carries what the cheat sheet has no answer for: read back requirements,
 * position reports, the phonetic alphabet, number transmission, surveillance
 * and emergency phraseology.
 *
 *   node scripts/build-radio-topics.mjs
 *
 * Reads docs/curriculum/radiotelephony/layout.json, writes topics.json beside it
 * in the same shape as the study baseline so the practice pipeline can consume
 * both without special cases.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const LAYOUT = resolve(here, "../docs/curriculum/radiotelephony/layout.json");
const OUT = resolve(here, "../docs/curriculum/radiotelephony/topics.json");

/** The manual's own part titles, used as chapters. */
const CHAPTERS = {
  1: "Reference material",
  2: "Fundamentals",
  3: "Non-controlled aerodromes",
  4: "Controlled airspace",
  5: "Controlled aerodromes",
  6: "Approach and departures",
  7: "Surveillance services",
  8: "Area control",
  9: "Distress and urgency",
};

/**
 * Sections that are administrative rather than operational. A pilot does not
 * revise the acronym list or how designators are registered.
 */
const SKIP = new Set(["1.1", "1.2", "1.3", "2.1", "2.2", "2.12", "2.14", "2.15"]);

/** Page furniture repeated on every page of the manual. */
const FURNITURE =
  /^(?:OFFICIAL|Radiotelephony manual for flight operations|Civil Aviation Safety Authority|Multi-Part AC .*|Page \d+ of \d+|Page \d+)$/i;

const SECTION_NUMBER = /^(\d{1,2}\.\d{1,2})$/;

const layout = JSON.parse(readFileSync(LAYOUT, "utf8"));

/** Every section heading, in document order, with where it starts. */
const headings = [];
for (const page of layout.pages) {
  if (page.page < 7) continue; // contents and front matter
  for (const line of page.linePositions) {
    const [numberCell, titleCell] = line.cells;
    if (!numberCell || !titleCell) continue;
    const match = SECTION_NUMBER.exec(numberCell.text.trim());
    const title = titleCell.text.trim();
    if (!match || numberCell.x > 110) continue;
    if (!/^[A-Z]/.test(title) || title.length < 5) continue;
    headings.push({ number: match[1], title, page: page.page, y: line.y });
  }
}

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Lines belonging to a section: from its heading to the next heading. */
function linesFor(index) {
  const start = headings[index];
  const end = headings[index + 1];
  const out = [];

  for (const page of layout.pages) {
    if (page.page < start.page) continue;
    if (end && page.page > end.page) break;
    for (const line of page.linePositions) {
      // PDF y grows upward, so "after the heading" means a smaller y.
      if (page.page === start.page && line.y >= start.y) continue;
      if (end && page.page === end.page && line.y <= end.y) continue;
      const text = line.cells.map((c) => c.text).join("  ").replace(/\s+/g, " ").trim();
      if (!text || FURNITURE.test(text)) continue;
      out.push(text);
    }
  }
  return out;
}

const topics = [];
for (let i = 0; i < headings.length; i++) {
  const heading = headings[i];
  if (SKIP.has(heading.number)) continue;
  const part = Number(heading.number.split(".")[0]);
  const chapter = CHAPTERS[part];
  if (!chapter) continue;
  // Prefixed so the section id is radio-*, which is what the radio pathway filters on.

  const lines = linesFor(i);
  // A section that is a page of transcript and nothing else has no rule to ask
  // about; it stays reading material rather than becoming a topic.
  if (lines.length < 3) continue;

  const endPage = headings[i + 1]?.page ?? layout.pages[layout.pages.length - 1].page;
  topics.push({
    id: `radio-${slug(heading.title)}`,
    title: heading.title,
    chapter: `Radio — ${chapter}`,
    parent: null,
    section: heading.number,
    source_pages: Array.from(
      { length: Math.max(1, endPage - heading.page + 1) },
      (_, n) => heading.page + n,
    ),
    lines,
  });
}

const payload = {
  source: "CASA Multi-Part AC 64.B-02, AC 91-35 and AC 172-05 — Radiotelephony manual for flight operations, v1.0, December 2025",
  generatedFrom: "docs/curriculum/radiotelephony/layout.json",
  generator: "scripts/build-radio-topics.mjs",
  topicCount: topics.length,
  topics,
};
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

const byChapter = topics.reduce((acc, t) => ((acc[t.chapter] = (acc[t.chapter] ?? 0) + 1), acc), {});
console.log(`Wrote ${topics.length} radio topics.`);
for (const [chapter, count] of Object.entries(byChapter)) {
  console.log(`  ${chapter.padEnd(28)} ${count}`);
}
