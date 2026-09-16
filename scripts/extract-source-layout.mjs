#!/usr/bin/env node
/**
 * Extract the source PDF with coordinates retained.
 *
 * The captured baseline in docs/curriculum/baseline/topics.json comes from a
 * plain text extraction, which flattened every table: "Class G Class E" on one
 * line, "5000M 5000M" on the next, row labels gone. Those tables carry the
 * numbers most worth drilling, so we re-extract positionally — every text run
 * with its x/y — and rebuild rows and columns from the geometry.
 *
 *   node scripts/extract-source-layout.mjs [--page N]
 *
 * Writes docs/curriculum/baseline/layout.json: one entry per page holding both
 * the reading-order lines and any detected tables.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Sources this script can extract. The cheat sheet is the study baseline; the
 * CASA radiotelephony manual is the source for the radio section, which the
 * cheat sheet covers in three pages and cannot support on its own.
 */
const SOURCES = {
  "reference-v7-1": {
    pdf: resolve(here, "../public/source/reference-v7-1/original.pdf"),
    out: resolve(here, "../docs/curriculum/baseline/layout.json"),
  },
  radiotelephony: {
    pdf: resolve(
      here,
      "../docs/content/multipart-ac-64b-02-ac-91-35-and-ac-172-05-radiotelephony-manual-for-flight-operations.pdf",
    ),
    out: resolve(here, "../docs/curriculum/radiotelephony/layout.json"),
  },
};

const sourceName = process.argv.includes("--source")
  ? process.argv[process.argv.indexOf("--source") + 1]
  : "reference-v7-1";
const source = SOURCES[sourceName];
if (!source) {
  console.error(`Unknown source "${sourceName}". Known: ${Object.keys(SOURCES).join(", ")}`);
  process.exit(1);
}
const PDF = source.pdf;
const OUT = source.out;

/** Text runs whose baselines are within this many points belong to one row. */
const ROW_TOLERANCE = 3.2;
/** A horizontal gap this wide or wider separates one column from the next. */
const COLUMN_GAP = 12;

const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");

/** Group text runs into rows by shared baseline, left to right. */
function toRows(items) {
  const runs = items
    .filter((i) => i.str.trim())
    .map((i) => ({
      text: i.str.replace(/\s+/g, " "),
      x: i.transform[4],
      y: i.transform[5],
      width: i.width,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const rows = [];
  for (const run of runs) {
    const row = rows.find((r) => Math.abs(r.y - run.y) <= ROW_TOLERANCE);
    if (row) {
      row.runs.push(run);
      // Keep the row anchored to its first baseline rather than drifting.
      row.runs.sort((a, b) => a.x - b.x);
    } else {
      rows.push({ y: run.y, runs: [run] });
    }
  }
  return rows;
}

/**
 * Split a row into cells wherever a horizontal gap exceeds COLUMN_GAP. A row
 * yielding two or more cells is a candidate table row; a single cell is prose.
 */
function toCells(row) {
  const cells = [];
  let current = null;
  for (const run of row.runs) {
    if (current && run.x - (current.x + current.width) < COLUMN_GAP) {
      current.text += ` ${run.text}`;
      current.width = run.x + run.width - current.x;
      continue;
    }
    current = { text: run.text, x: run.x, width: run.width };
    cells.push(current);
  }
  return cells.map((c) => ({ text: c.text.replace(/\s+/g, " ").trim(), x: Math.round(c.x) }));
}

/**
 * Cell origins wobble by a point or two between rows, so group nearby origins
 * into one column and represent it by the leftmost value in the group.
 */
function clusterColumns(xs) {
  const sorted = [...xs].sort((a, b) => a - b);
  const columns = [];
  for (const x of sorted) {
    const last = columns[columns.length - 1];
    if (last !== undefined && x - last <= COLUMN_GAP) continue;
    columns.push(x);
  }
  return columns;
}

/**
 * Consecutive multi-cell rows sharing column positions form a table. Requiring
 * a run of at least three such rows keeps two-column prose from being read as
 * tabular.
 */
function detectTables(rows) {
  const tables = [];
  let run = [];

  const flush = () => {
    if (run.length >= 3) {
      const columns = clusterColumns(run.flatMap((r) => r.map((c) => c.x)));
      tables.push({
        // Baseline of the table's first row. Several topics can share a page,
        // so a table must be attributable to the heading directly above it.
        y: Math.round(run[0].y ?? 0),
        columnCount: columns.length,
        rows: run.map((cells) => {
          const out = Array.from({ length: columns.length }, () => "");
          for (const cell of cells) {
            // Each cell belongs to exactly one column: the nearest origin.
            let best = 0;
            for (let i = 1; i < columns.length; i++) {
              if (Math.abs(cell.x - columns[i]) < Math.abs(cell.x - columns[best])) best = i;
            }
            out[best] = out[best] ? `${out[best]} ${cell.text}` : cell.text;
          }
          return out;
        }),
      });
    }
    run = [];
  };

  for (const row of rows) {
    const cells = toCells(row);
    if (cells.length >= 2) {
      cells.y = row.y;
      run.push(cells);
    } else flush();
  }
  flush();
  return tables;
}

const data = new Uint8Array(readFileSync(PDF));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;

const only = process.argv.includes("--page")
  ? Number(process.argv[process.argv.indexOf("--page") + 1])
  : null;

const pages = [];
for (let n = 1; n <= pdf.numPages; n++) {
  if (only && n !== only) continue;
  const page = await pdf.getPage(n);
  const content = await page.getTextContent();
  const rows = toRows(content.items);
  pages.push({
    page: n,
    lines: rows.map((r) => toCells(r).map((c) => c.text).join("  ")).filter(Boolean),
    // Keep every line's baseline so a table can be tied to the topic heading
    // above it when a page carries more than one topic.
    // Keep each line's cells with their origins. Scenario transcripts in the
    // radiotelephony manual put the speaker in a narrow left column, vertically
    // centred against a multi-line transmission on the right, so the rows are
    // not uniformly two-celled and turns can only be rebuilt from geometry.
    linePositions: rows
      .map((r) => {
        const cells = toCells(r);
        return { y: Math.round(r.y), text: cells.map((c) => c.text).join("  "), cells };
      })
      .filter((l) => l.text),
    tables: detectTables(rows),
  });
}

if (only) {
  console.log(JSON.stringify(pages[0], null, 2));
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ source: sourceName, pages }, null, 2) + "\n");
  const withTables = pages.filter((p) => p.tables.length);
  console.log(`Extracted ${pages.length} pages.`);
  console.log(`  pages with tables: ${withTables.length}`);
  console.log(`  tables total: ${withTables.reduce((a, p) => a + p.tables.length, 0)}`);
}
