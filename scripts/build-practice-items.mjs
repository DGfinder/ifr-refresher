#!/usr/bin/env node
/**
 * Derive practice items from the captured baseline source text.
 *
 * The baseline is legislative prose with regular shapes — regulation headings,
 * lettered clauses, enumerated lists and numerics in context. Each shape maps to
 * a question worth answering out loud in an IPC oral, so we extract by shape
 * rather than blanking words at random.
 *
 * Output is committed so item changes show up in diffs, and so question ids —
 * which hash the prompt — only move when the generator or the source moves.
 *
 *   node scripts/build-practice-items.mjs [--check]
 *
 * --check exits non-zero if the committed output is stale.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "../docs/curriculum/baseline/topics.json");
const LAYOUT = resolve(here, "../docs/curriculum/baseline/layout.json");
const OUT = resolve(here, "../src/content/practice/items.generated.json");

/**
 * A "label" that is really just a measurement means the table carried its row
 * meaning in something other than words — in this source, arrow glyphs that do
 * not survive text extraction (see the VMC table on page 18). Asking
 * "Class G? -> 5000M" would lose which minimum it is, so these are skipped and
 * the page image is shown instead.
 */
function isBareQuantity(text) {
  return /^[\d.,]+\s*(?:M|KM|FT|NM|KT|°|%)?\s*(?:\(.*\))?$/i.test(text.trim());
}

// ---------------------------------------------------------------- text repair

/** Page furniture repeated on every captured page. */
const PAGE_FURNITURE = /Page \d+ of \d+[\s\S]*?Back to top[ \t]*/g;

/**
 * A line that opens a new structural unit rather than continuing the last one.
 * The source uses both `(a)` and bare `a)` for clause labels, and numbers its
 * sub-points as `1.` or `(1)`.
 */
const OPENS_UNIT =
  /^(?:\(\s*[a-z]{1,3}\s*\)|[a-z]{1,2}[).]\s|\(\s*\d{1,2}\s*\)|\d{1,2}\.\s|[•▪]|(?:CASR|CAO|CAR|AIP|ERSA|Part\s\d)\b|Note[:\s]|Sector\s\d)/i;

/** URLs and access notes captured alongside figures; never useful as questions. */
const NOISE = /^(?:Accessed from|https?:\/\/|Right Turns|Left Turns)/i;

/**
 * PDF extraction wraps sentences mid-line. A wrapped continuation almost always
 * starts lowercase, whereas headings, labels and table rows start with a capital,
 * a digit or a marker — that is a far more reliable signal than line length.
 */
function repair(raw) {
  const lines = raw
    .replace(PAGE_FURNITURE, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && !NOISE.test(l));

  const out = [];
  for (const line of lines) {
    const previous = out[out.length - 1];
    const continues =
      previous !== undefined &&
      !OPENS_UNIT.test(line) &&
      /^[a-z]/.test(line) &&
      !/[.;:]$/.test(previous);
    if (continues) out[out.length - 1] = `${previous} ${line}`;
    else out.push(line);
  }
  return out;
}

// ------------------------------------------------------------------ extractors

const REG_HEADING = /^((?:CASR|CAO|CAR)\s[\d.]+[A-Z]?)\s*[–—-]\s*(.+)$/;
const LETTERED = /^\(?\s*([a-z]{1,2})\s*\)\s*(.+)$/i;
const LABELLED_CLAUSE = /^\(?\s*[a-z]{1,2}\s*\)\s*([A-Z][A-Za-z/ ]{2,28})\.\s+(.+)$/;

/**
 * A flattened table row: a short label followed by a quantity, e.g.
 * "Day VFR 30 minutes -" or "Up to and inc. FL140 230". These carry the
 * numbers most worth drilling, and prose extractors miss them entirely.
 */
const TABLE_ROW =
  /^(.{3,48}?)\s+((?:\d{1,3}(?:,\d{3})?(?:\.\d)?\s?(?:ft|FT|feet|NM|nm|KT|KIAS|kt|knots|M|KM|km|kg|days|months|minutes|minute|mins|min|hours|%|°)|FL\d{2,3})(?:\s*[-–]\s*\S*)?)$/;

/** Sub-headings inside a topic, e.g. "Sector 3 entry (Direct Entry)". */
const SUB_HEADING = /^((?:Sector \d|DME Arc)[A-Za-z0-9 ()]{0,40})$/;

/** An enumerated step: "(i) ...", "(a) ...", "a. ...", "b) ...". */
const ENUM_ITEM = /^\(?\s*([a-z]{1,3}|\d{1,2})\s*[).]\s+(.{10,})$/i;

/** Any enumerated line, including one-word list members like "(e) airship". */
const ENUM_ANY = /^\(?\s*(?:[a-z]{1,3}|\d{1,2})\s*[).]\s+\S/i;

/** A step long enough to be an instruction rather than a list member. */
const STEP_MIN_CHARS = 40;

/**
 * The lead-in a group of enumerated items belongs to. The source consistently
 * writes these as a line ending in a colon ("Indications by an Aircraft:") or a
 * short title line, so a step can be asked in context instead of floating free.
 */
function headingFor(lines, index) {
  for (let i = index - 1; i >= 0 && index - i <= 8; i--) {
    const candidate = lines[i];
    if (ENUM_ANY.test(candidate)) continue;
    if (/^(?:CASR|CAO|CAR|AIP|ERSA|Part\s\d|Note)/i.test(candidate)) continue;
    if (!isUsableHeading(candidate)) continue;
    return candidate.replace(/[:.]$/, "").trim();
  }
  return null;
}

/**
 * Table extraction leaves stray fragments ("150;", "and") between real lines.
 * A usable heading is a short phrase of at least two word-like tokens that is
 * not a dangling conjunction or a severed table cell.
 */
function isUsableHeading(line) {
  const text = line.replace(/[:.]$/, "").trim();
  if (text.length < 6 || text.length > 60) return false;
  if (text.endsWith(";")) return false;
  if (/^\d/.test(text)) return false;
  if (/^(?:and|or|either|both|note)\b/i.test(text)) return false;
  const words = text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  return words.length >= 2;
}

/**
 * Consecutive short enumerated members starting at `index`, e.g. the five
 * aircraft categories under CASR 61.015. Asked as one list question rather
 * than five fragments.
 */
function runOfListMembers(lines, index) {
  const members = [];
  for (let i = index; i < lines.length; i++) {
    const m = ENUM_ITEM.exec(lines[i]) ?? /^\(?\s*(?:[a-z]{1,3}|\d{1,2})\s*[).]\s+(.+)$/i.exec(lines[i]);
    if (!m) break;
    const body = (m.length === 3 ? m[2] : m[1]).trim();
    if (body.length >= STEP_MIN_CHARS) break;
    const cleaned = body.replace(/[;.]$/, "").trim();
    // The source puts conjunctions on their own lines; they are not members.
    if (/^(?:and|or|either|either:|both)$/i.test(cleaned)) continue;
    members.push(cleaned);
  }
  return members;
}

/** Units we can pool plausible distractors from, keyed by a normalising tag. */
const QUANTITY =
  /\b(\d{1,3}(?:,\d{3})?(?:\.\d)?)\s?(ft|FT|feet|NM|nm|KT|KIAS|kt|knots|days|months|minutes|minute|mins|min|hours|°)\b|\b(FL\d{2,3})\b/g;

function unitTag(unit) {
  const u = unit.toLowerCase();
  if (["ft", "feet"].includes(u)) return "ft";
  if (["nm"].includes(u)) return "nm";
  if (["kt", "kias", "knots"].includes(u)) return "kt";
  if (["minutes", "minute", "mins", "min"].includes(u)) return "min";
  if (["hours"].includes(u)) return "hr";
  if (["days"].includes(u)) return "day";
  if (["months"].includes(u)) return "month";
  if (u === "°") return "deg";
  return u;
}

/** Collect every quantity in the corpus so distractors are same-unit and real. */
function quantityPool(topics) {
  const pool = new Map();
  for (const topic of topics) {
    for (const line of topic.lines) {
      for (const m of line.matchAll(QUANTITY)) {
        const [, value, unit, flightLevel] = m;
        const tag = flightLevel ? "fl" : unitTag(unit);
        const text = flightLevel ?? `${value} ${unit}`;
        if (!pool.has(tag)) pool.set(tag, new Set());
        pool.get(tag).add(text.trim());
      }
    }
  }
  return new Map([...pool].map(([k, v]) => [k, [...v]]));
}

function extract(topic, pool) {
  const items = [];
  const seen = new Set();
  const push = (item) => {
    const key = `${item.kind}::${item.prompt}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  const { lines, title } = topic;

  // 0. Rows recovered by positional extraction. Only where the label is words —
  //    a bare-quantity label means the row's meaning lived in a glyph.
  for (const row of topic.tableRows) {
    const { label, value } = row;
    if (isBareQuantity(label) || !/[a-z]{3}/i.test(label)) continue;
    if (!value || value === "-" || value.length > 40) continue;
    if (isBareQuantity(label) === isBareQuantity(value) && !isBareQuantity(value)) continue;
    if (label.split(/\s+/).length > 12) continue;
    const tag = /^FL/.test(value) ? "fl" : unitTag(value.replace(/[\d,.\s]/g, ""));
    const candidates = (pool.get(tag) ?? []).filter((c) => c !== value);
    push({
      kind: "table",
      prompt: `${title} — ${label.replace(/[:.]$/, "")}?`,
      answer: value,
      page: row.page,
      ...(candidates.length >= 3
        ? { distractors: pickThree(candidates, `${topic.id}:${label}`) }
        : {}),
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Regulation heading -> what does this rule cover, and what follows it.
    const reg = REG_HEADING.exec(line);
    if (reg) {
      const [, ref, subject] = reg;
      push({
        kind: "definition",
        prompt: `${title} — what does ${ref} cover?`,
        answer: subject.replace(/\s*[–—-]\s*$/, "").trim(),
      });

      // The enumerated list directly under a heading is the rule's substance.
      const listed = [];
      for (let j = i + 1; j < lines.length; j++) {
        const item = LETTERED.exec(lines[j]);
        if (!item) break;
        listed.push(item[2].replace(/[;.]$/, "").trim());
      }
      if (listed.length >= 3) {
        push({
          kind: "list",
          prompt: `${ref} — ${subject.replace(/\s*[–—-]\s*$/, "").trim()}. List them.`,
          answer: listed.join("; "),
          itemCount: listed.length,
        });
      }
      continue;
    }

    // 2. Labelled clause: "(a) Speed. IAS must not exceed ..."
    const clause = LABELLED_CLAUSE.exec(line);
    if (clause) {
      const [, label, body] = clause;
      push({
        kind: "clause",
        prompt: `${title} — ${label.trim()}?`,
        answer: body.trim(),
      });
      continue;
    }

    // 3. Enumerated requirement under the nearest preceding heading, e.g.
    //    "(i) during the hours of daylight - by rocking the aircraft's wings".
    //    These are the procedural steps the source actually wants recalled.
    if (ENUM_ANY.test(line)) {
      const enumerated = ENUM_ITEM.exec(line);
      const body = enumerated?.[2]?.trim() ?? "";
      const context = headingFor(lines, i);

      // A substantial instruction is worth asking on its own. A body ending in
      // a colon is a legislative container ("(1) Each of the following is...:")
      // whose substance is the list beneath it, not the line itself.
      const isLeadIn = body.endsWith(":");
      if (body.length >= STEP_MIN_CHARS && context && !isLeadIn) {
        push({
          kind: "step",
          prompt: `${title} — ${context} (${enumerated[1]})?`,
          answer: body.replace(/[;,]$/, "").trim(),
        });
        continue;
      }

      // A run of short members is one list, asked once. Skip past the whole run
      // so its members don't also surface individually.
      const members = runOfListMembers(lines, i);
      if (members.length >= 3 && context) {
        push({
          kind: "list",
          prompt: `${title} — ${context}. List them.`,
          answer: members.join("; "),
          itemCount: members.length,
        });
        i += members.length - 1;
      }
      continue;
    }

    // 4. Sub-heading followed by its explanation, e.g. "Sector 3 entry (Direct Entry)".
    const sub = SUB_HEADING.exec(line);
    if (sub && lines[i + 1] && lines[i + 1].length > 40) {
      push({
        kind: "clause",
        prompt: `${title} — describe ${sub[1].trim()}.`,
        answer: lines[i + 1].trim(),
      });
      continue;
    }

    // 4. Flattened table row: label -> quantity. The densest examinable facts
    //    in the document sit in tables, not prose.
    const row = TABLE_ROW.exec(line);
    if (row) {
      const label = row[1].replace(/[-–|]+$/, "").trim();
      const value = row[2].replace(/\s*[-–]\s*$/, "").trim();
      const looksLikeLabel = /[a-z]/i.test(label) && label.split(" ").length <= 8;
      if (looksLikeLabel && value) {
        const tag = /^FL/.test(value) ? "fl" : unitTag(value.replace(/[\d,. ]/g, ""));
        const candidates = (pool.get(tag) ?? []).filter((c) => c !== value);
        push({
          kind: "table",
          prompt: `${title} — ${label}?`,
          answer: value,
          ...(candidates.length >= 3
            ? { distractors: pickThree(candidates, `${topic.id}:${label}`) }
            : {}),
        });
        continue;
      }
    }

    // 5. Cloze over a quantity, where the surrounding sentence carries meaning.
    if (line.length >= 50 && line.length <= 400) {
      const hits = [...line.matchAll(QUANTITY)];
      if (hits.length === 1) {
        const m = hits[0];
        const [matched, value, unit, flightLevel] = m;
        const tag = flightLevel ? "fl" : unitTag(unit);
        const answer = (flightLevel ?? `${value} ${unit}`).trim();
        const candidates = (pool.get(tag) ?? []).filter((c) => c !== answer);
        // Needs real sentence on both sides of the blank, and must not be a
        // dangling lead-in — otherwise the prompt reads as a fragment.
        const leading = line.slice(0, m.index).trim();
        const trailing = line.slice(m.index + matched.length).trim();
        const isSentence = leading.length >= 20 && !line.trim().endsWith(":");
        if (candidates.length >= 3 && isSentence && trailing.length >= 3) {
          const blanked = `${leading} _____ ${trailing}`;
          push({
            kind: "cloze",
            prompt: `${title} — fill the blank: ${blanked}`,
            answer,
            distractors: pickThree(candidates, `${topic.id}:${answer}:${m.index}`),
          });
        }
      }
    }
  }

  return items;
}

/**
 * Deterministic three-of-n choice. Seeded by content so regenerating produces
 * the same distractors, which keeps prompts — and therefore question ids —
 * stable across builds.
 */
function pickThree(candidates, seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  const ranked = [...candidates].sort((a, b) => a.localeCompare(b));
  const out = [];
  for (let i = 0; i < 3 && ranked.length; i++) {
    h = (h * 16777619) >>> 0;
    out.push(ranked.splice(h % ranked.length, 1)[0]);
  }
  return out;
}

// ------------------------------------------------------------------------ main

const { topics: rawTopics } = JSON.parse(readFileSync(SOURCE, "utf8"));
const layout = JSON.parse(readFileSync(LAYOUT, "utf8"));
const layoutByPage = new Map(layout.pages.map((p) => [p.page, p]));

/** Every topic title, for recognising where one topic's section ends on a page. */
const TOPIC_TITLES = new Set(rawTopics.map((t) => t.title.trim().toLowerCase()));

const topics = rawTopics.map((t) => ({
  id: t.id,
  title: t.title,
  chapter: t.chapter,
  parent: t.parent,
  pages: t.source_pages,
  lines: repair(t.fragments.map((f) => f.text).join("\n")),
  // Positional extraction recovers rows the flat text destroyed. Pages can
  // carry several topics, so only take tables that sit under this topic's own
  // heading (see tablesUnderHeading).
  tableRows: t.source_pages.flatMap((page) =>
    tablesUnderHeading(layoutByPage.get(page), t.title).flatMap((table) =>
      table.rows
        .map((row) => row.filter((c) => c.trim()))
        .filter((cells) => cells.length === 2)
        .map(([label, value]) => ({ page, label: label.trim(), value: value.trim() })),
    ),
  ),
}));

/**
 * Tables belonging to `title` on this page: those below the topic's heading and
 * above whatever heading comes next. Page 18 carries both Visual Meteorological
 * Conditions and Transponder codes, and the transponder table must not be
 * attributed to VMC.
 */
function tablesUnderHeading(page, title) {
  if (!page) return [];
  const headingLine = page.linePositions.find(
    (l) => l.text.trim().toLowerCase() === title.trim().toLowerCase(),
  );
  // Heading not found on this page (continuation pages): the whole page is ours.
  if (!headingLine) return page.tables;

  // PDF y grows upward, so "below the heading" means a smaller y.
  const nextHeadingY = page.linePositions
    .filter((l) => l.y < headingLine.y && isOtherTopicHeading(l.text, title))
    .reduce((highest, l) => (highest === null || l.y > highest ? l.y : highest), null);

  return page.tables.filter(
    (t) => t.y < headingLine.y && (nextHeadingY === null || t.y > nextHeadingY),
  );
}

/** Topic headings in this source are short, title-case and unpunctuated. */
function isOtherTopicHeading(text, title) {
  const t = text.trim();
  if (t.toLowerCase() === title.trim().toLowerCase()) return false;
  if (t.length < 6 || t.length > 60) return false;
  if (/[.:;,]$/.test(t)) return false;
  if (/^(?:CASR|CAO|CAR|AIP|ERSA|Part\s\d|Note|\()/i.test(t)) return false;
  return TOPIC_TITLES.has(t.toLowerCase());
}

const pool = quantityPool(topics);

const items = [];
const perTopic = [];
for (const topic of topics) {
  const extracted = extract(topic, pool);
  perTopic.push({ id: topic.id, title: topic.title, count: extracted.length });
  for (const item of extracted) {
    items.push({
      topicId: topic.id,
      topicTitle: topic.title,
      chapter: topic.chapter,
      ...item,
    });
  }
}

const payload = {
  generatedFrom: "docs/curriculum/baseline/topics.json",
  generator: "scripts/build-practice-items.mjs",
  itemCount: items.length,
  items,
};
const serialised = JSON.stringify(payload, null, 2) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    console.error("Practice items missing. Run: npm run practice:build");
    process.exit(1);
  }
  if (current !== serialised) {
    console.error("Practice items are stale. Run: npm run practice:build");
    process.exit(1);
  }
  console.log(`Practice items up to date: ${items.length} items.`);
  process.exit(0);
}

writeFileSync(OUT, serialised);

const byKind = items.reduce((acc, i) => ((acc[i.kind] = (acc[i.kind] ?? 0) + 1), acc), {});
const thin = perTopic.filter((t) => t.count < 3);
console.log(`Wrote ${items.length} practice items across ${topics.length} topics.`);
console.log("  by kind:", Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join("  "));
console.log(`  thin topics (<3 items): ${thin.length}`);
for (const t of thin) console.log(`    ${t.id} (${t.count})`);
