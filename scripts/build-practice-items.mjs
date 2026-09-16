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
const OVERRIDES = resolve(here, "../src/content/practice/overrides.json");
const READING_PLANS = resolve(here, "../src/features/baseline/model/reviewedPlans.json");
const RADIO = resolve(here, "../docs/curriculum/radiotelephony/topics.json");
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
/** A numbered clause marker in the radiotelephony manual, e.g. "4.1.2 ". */
const CLAUSE_NUMBER = /^\d{1,2}\.\d{1,2}(?:\.\d{1,2})?\s+/;

function repair(raw, { markerRuled = false } = {}) {
  const lines = raw
    .replace(PAGE_FURNITURE, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && !NOISE.test(l));

  const out = [];
  for (const line of lines) {
    const previous = out[out.length - 1];
    // The cheat sheet wraps onto lowercase, which is the reliable signal there.
    // The radiotelephony manual wraps onto acronyms — "...read back to" / "ATC:"
    // — so case says nothing; only a structural marker starts a new unit.
    const startsUnit = markerRuled
      ? OPENS_UNIT.test(line) || CLAUSE_NUMBER.test(line) || /^Note[:\s]/i.test(line)
      : OPENS_UNIT.test(line) || !/^[a-z]/.test(line);
    const continues = previous !== undefined && !startsUnit && !/[.;:]$/.test(previous);
    if (continues) out[out.length - 1] = `${previous} ${line}`;
    else out.push(line);
  }
  return out;
}

// ------------------------------------------------------------------ extractors

const REG_HEADING = /^((?:CASR|CAO|CAR)\s[\d.]+[A-Z]?)\s*[–—-]\s*(.+)$/;
const LETTERED = /^\(?\s*([a-z]{1,2})\s*\)\s*(.+)$/i;
const LABELLED_CLAUSE = /^\(?\s*[a-z]{1,2}\s*\)\s*([A-Z][A-Za-z/ ]{2,28})\.\s+(.+)$/;

/** Sub-headings inside a topic, e.g. "Sector 3 entry (Direct Entry)". */
const SUB_HEADING = /^((?:Sector \d|DME Arc)[A-Za-z0-9 ()]{0,40})$/;

/**
 * An enumerated step: "(i) ...", "(a) ...", "a. ...", "b) ...".
 *
 * The marker must be a lowercase single letter, a roman numeral or a number.
 * A looser `[a-z]{1,3}` matches ordinary prose — this source is full of
 * sentences ending "QNH.", "ATC.", "NM." — and turns a wrapped sentence into a
 * bogus enumerated item whose "answer" is the next sentence.
 */
const ENUM_ITEM = /^\(?\s*((?:[ivx]{1,3}|[a-z])|\d{1,2})\s*[).]\s+(.{10,})$/;

/** Any enumerated line, including one-word list members like "(e) airship". */
const ENUM_ANY = /^\(?\s*(?:(?:[ivx]{1,3}|[a-z])|\d{1,2})\s*[).]\s+\S/;

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
    // A member of this same list is not its lead-in; keep walking past it.
    if (ENUM_ANY.test(candidate)) continue;

    // A colon-terminated line is the lead-in, whatever its length. Length was
    // the original test, and it silently skipped long lead-ins to grab an
    // earlier list's heading — pairing one rule's question with another
    // rule's answer.
    if (candidate.trim().endsWith(":")) {
      return candidate.replace(/[:.]$/, "").replace(/^[—–-]\s*/, "").trim();
    }

    // Anything else that opens a new structural unit means we have walked out
    // of this list's scope. Stop rather than reach further back: no context is
    // better than the wrong context.
    if (/^(?:CASR|CAO|CAR|AIP|ERSA|Part\s\d|Note|\()/i.test(candidate)) return null;
    if (!isUsableHeading(candidate)) return null;
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
  // Citations, footnotes and bullets are not questions anyone can answer.
  if (/^[(*•▪]/.test(text)) return false;
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
    // The source puts conjunctions on their own lines and at the end of
    // members; neither is part of the member.
    const cleaned = body
      .replace(/[;.]$/, "")
      .replace(/[;,]?\s*\b(?:and|or)\s*$/i, "")
      .trim();
    if (!cleaned || /^(?:and|or|either|either:|both)$/i.test(cleaned)) continue;
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

    // Tables are read from the positional layout (extractor 0), never from this
    // flattened text. Running TABLE_ROW over `repair()`ed lines is exactly the
    // mistake the layout re-extraction exists to correct: it read "Up to and
    // inc. FL140 | 230" as label "Up to and inc." and value "FL140", losing the
    // 230 KIAS that is the actual answer, and it dropped the Day/Night column
    // header from the visual approach table so a day-only criterion read as
    // unconditional. Three items, three wrong.

    // 4. Cloze over a quantity, where the surrounding sentence carries meaning.
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
  const ranked = [...candidates].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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
  if (!headingLine) {
    // Heading not found. On a page this topic has to itself, it is a
    // continuation page and the tables are ours. On a shared page, attribution
    // is unknown — and taking every table would hand one topic its
    // neighbour's, so take none.
    const owners = rawTopics.filter((t) => t.source_pages.includes(page.page));
    return owners.length === 1 ? page.tables : [];
  }

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

/**
 * Hand-written items for topics the extractor cannot serve — in this source,
 * tables whose row meaning lives in arrow glyphs that carry no Unicode. These
 * are transcribed from the page image, and a topic listed here replaces
 * whatever the extractor produced for it rather than adding to it.
 */
let overrides = { topics: {} };
try {
  overrides = JSON.parse(readFileSync(OVERRIDES, "utf8"));
} catch {
  // Optional file; absence just means no topic is overridden.
}

// A typo'd topic id would silently fall back to the extractor's output for a
// topic the extractor is known to get wrong, which is the failure this file
// exists to prevent. Fail loudly instead.
{
  const known = new Set(rawTopics.map((t) => t.id));
  const problems = [];
  for (const [topicId, entry] of Object.entries(overrides.topics ?? {})) {
    if (!known.has(topicId)) problems.push(`unknown topic id "${topicId}"`);
    if (!Array.isArray(entry?.items) || entry.items.length === 0) {
      problems.push(`"${topicId}" has no items`);
      continue;
    }
    entry.items.forEach((item, index) => {
      if (!item?.prompt?.trim() || !item?.answer?.trim()) {
        problems.push(`"${topicId}" item ${index} is missing a prompt or answer`);
      }
      if (!item?.kind) problems.push(`"${topicId}" item ${index} is missing a kind`);
    });
  }
  if (problems.length) {
    console.error("Invalid overrides.json:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
}

/**
 * The phraseology pages are a sequence of situation headings each followed by
 * the call to make. The reviewed reading plans already model that as heading
 * and call blocks, so pair them up rather than re-deriving the structure: the
 * situation becomes the prompt and the call script becomes the answer.
 */
function radioCallItems(topic) {
  const plans = JSON.parse(readFileSync(READING_PLANS, "utf8"));
  const list = Array.isArray(plans) ? plans : Object.values(plans);
  const out = [];

  for (const page of topic.pages) {
    const plan = list.find((p) => p && p.topicId === topic.id && p.page === page);
    if (!plan) continue;
    const source = rawTopics
      .find((t) => t.id === topic.id)
      .fragments.find((f) => f.page === page);
    if (!source) continue;
    const lines = source.text.split("\n");
    const textOf = ([start, end]) =>
      lines
        .slice(start, end + 1)
        .map((line) => line.trim())
        .filter(Boolean);

    for (let i = 0; i < plan.blocks.length - 1; i++) {
      const heading = plan.blocks[i];
      const call = plan.blocks[i + 1];
      if (heading.kind !== "heading" || call.kind !== "call") continue;
      const situation = textOf(heading.range).join(" ");
      const script = textOf(call.range);
      if (!situation || script.length < 2) continue;
      out.push({
        kind: "call",
        prompt: `${topic.title} — ${situation}: what do you say?`,
        answer: script.join("\n"),
        page,
      });
    }
  }
  return out;
}

/**
 * Radio topics come from the CASA radiotelephony manual rather than the study
 * baseline. Their lines are already positionally extracted, so they only need
 * the same wrap repair before going through the same shape extractors.
 */
const radioTopics = JSON.parse(readFileSync(RADIO, "utf8")).topics.map((t) => ({
  id: t.id,
  title: t.title,
  chapter: t.chapter,
  parent: null,
  pages: t.source_pages,
  // Clause numbers are structure, not content; left in, they appear in every
  // prompt and every lead-in.
  lines: repair(t.lines.join("\n"), { markerRuled: true }).map((line) =>
    line.replace(CLAUSE_NUMBER, "").trim(),
  ),
  tableRows: [],
}));

const items = [];
const perTopic = [];
for (const topic of [...topics, ...radioTopics]) {
  const override = overrides.topics?.[topic.id];
  const derived =
    topic.chapter === "Phraseology" ? radioCallItems(topic) : extract(topic, pool);
  // An override normally replaces what the extractor produced, because it is
  // there precisely where extraction cannot work. `"mode": "extend"` keeps both,
  // for topics where the derived items are sound and the override only adds a
  // format the extractor cannot produce — true/false over the radio calls.
  const transcribed = (override?.items ?? []).map((item) => ({ ...item, source: "transcribed" }));
  const extracted = !override
    ? derived
    : override.mode === "extend"
      ? [...derived, ...transcribed]
      : transcribed;
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

/**
 * Fill in distractors from sibling rows of the same table.
 *
 * The quiz deliberately refuses to borrow an answer from an unrelated card,
 * because a fact that is true elsewhere is not a safe wrong answer here. Rows
 * of one table asked in one shape are the exception: "Circling Areas —
 * Category B?" is precisely the plausible wrong answer to "Category A?", and
 * that is how the question gets asked in an oral.
 *
 * A sibling answer identical to the correct one is skipped — several classes
 * share the same minima, and a "wrong" option that is actually right would
 * make the question unanswerable.
 */
/**
 * The prompt with its varying token blanked, so rows of one table collapse to a
 * single stem: "Circling Areas — Category A: ..." and "... Category B: ..." both
 * become "circling areas — category _: ...". Items that differ in more than the
 * token are not siblings, and must not lend each other options.
 */
function familyStem(prompt) {
  const text = prompt.toLowerCase().trim();
  // These prompts read "Topic — Qualifier: question?". The question after the
  // colon is what makes two rows the same question, so group on that; the
  // qualifier before it is exactly what varies between rows. Without a colon,
  // the topic title is the varying part, so drop everything before the dash.
  const colon = text.lastIndexOf(":");
  const dash = text.lastIndexOf("—");
  const stem = colon > 0 ? text.slice(colon + 1) : dash > 0 ? text.slice(dash + 1) : text;
  return stem
    .replace(/\b(category|class|sector)\s+[a-z0-9]+\b/g, "$1 _")
    .replace(/\b[0-9]+(\.[0-9]+)?\b/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

/** A prompt asking about one aircraft performance category, e.g. "Category D". */
const CATEGORY_PROMPT = /\b(?:category|cat)\s+[A-E]\b/i;
const CATEGORY_B = /\b(?:category|cat)\s+B\b/i;
const isCategoryPrompt = (item) => CATEGORY_PROMPT.test(item.prompt);

function addSiblingDistractors(allItems) {
  const families = new Map();
  for (const item of allItems) {
    // Radio calls are multi-line scripts. They belong in recall, not in a
    // four-option list where every option is a paragraph.
    if (item.kind === "call") continue;
    // "What does CASR 61.870 cover?" is the same question wherever it is asked,
    // and another regulation's title is a fair wrong answer to it — so these
    // group across topics. Everything else stays within its own topic, where
    // the sibling relationship is what makes an option plausible rather than
    // merely different.
    const key =
      item.kind === "definition"
        ? `definition::${familyStem(item.prompt)}`
        : `${item.topicId}::${item.kind}::${familyStem(item.prompt)}`;
    const family = families.get(key);
    if (family) family.push(item);
    else families.set(key, [item]);
  }

  let filled = 0;
  for (const family of families.values()) {
    if (family.length < 4) continue;

    // Where a family is one question asked per aircraft category, only the
    // Category B member is worth scoring — that is the aeroplane being flown.
    // The other categories stay as flashcards and serve as this question's
    // wrong answers, which is exactly the confusion worth testing.
    const scoreable = family.some(isCategoryPrompt)
      ? family.filter((item) => CATEGORY_B.test(item.prompt))
      : family;

    for (const item of scoreable) {
      if (item.distractors?.length === 3) continue;
      const normalised = item.answer.trim().toLowerCase();
      const candidates = family
        .filter((other) => other !== item && other.answer.trim().toLowerCase() !== normalised)
        .map((other) => other.answer);
      const unique = [...new Set(candidates)];
      if (unique.length < 3) continue;
      item.distractors = pickThree(unique, `${item.topicId}:${item.prompt}`);
      filled += 1;
    }
  }
  return filled;
}

/**
 * Final gate: drop anything that is not a well-formed question.
 *
 * The extractors work on shape, and shape alone cannot tell a complete clause
 * from one severed mid-sentence by a line wrap. Since a wrong or meaningless
 * answer is worse than a missing one, everything doubtful dies here rather
 * than being patched into plausibility upstream. Transcribed items are exempt:
 * they were written by hand against the page image.
 */
const DANGLING_TAIL =
  /\b(?:the|a|an|of|for|to|in|on|at|and|or|is|are|be|not|exceed|within|see\s+ENR|than|with|from|by)$/i;

function isWellFormed(item) {
  if (item.source === "transcribed") return true;
  const prompt = item.prompt?.trim() ?? "";
  const answer = item.answer?.trim() ?? "";
  if (!prompt || !answer) return false;

  const context = prompt.split("—").slice(1).join("—").trim();
  // A cloze prompt carries the sentence itself, so it must be whole. Others
  // carry a lead-in, which becomes unreadable past a sentence or so.
  if (item.kind === "cloze") {
    const sentence = context.replace(/^fill the blank:\s*/i, "");
    if (DANGLING_TAIL.test(sentence.replace(/[?:]+$/, ""))) return false;
    // Starts with the severed tail of the previous sentence, e.g. "QNH. These
    // minima may be reduced by ...". A real opening clause is longer than an
    // abbreviation before its first full stop.
    const firstStop = sentence.indexOf(". ");
    if (firstStop >= 0 && firstStop <= 5) return false;
    // Starts mid-clause.
    if (/^[a-z)]/.test(sentence)) return false;
  } else if (context.length > 160) {
    return false;
  }
  // The source's author notes describe rules that no longer apply; drilling a
  // rescinded figure teaches the wrong thing.
  if (/author[’'`]?s note/i.test(prompt)) return false;
  // Severed mid-sentence by a line wrap.
  if (DANGLING_TAIL.test(answer)) return false;
  // An unclosed citation or parenthetical means the tail was lost.
  if ((answer.match(/\(/g) ?? []).length !== (answer.match(/\)/g) ?? []).length) return false;
  // Too short to be an answer to anything.
  if (answer.length < 4) return false;
  // The prompt gives its own answer away.
  if (answer.length > 3 && prompt.toLowerCase().includes(answer.toLowerCase())) return false;
  // A prompt that is only a stem, e.g. "Within?"
  const asked = prompt.split("—").pop().trim();
  if (asked.replace(/[?:]/g, "").trim().split(/\s+/).length < 2) return false;
  return true;
}

const beforeGate = items.length;
const kept = items.filter(isWellFormed);
items.length = 0;
items.push(...kept);
const suppressed = beforeGate - items.length;

const siblingFilled = addSiblingDistractors(items);

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
const quizEligible = items.filter(
  (i) => i.distractors?.length === 3 || i.distractors?.length === 1,
).length;
console.log(`Wrote ${items.length} practice items across ${topics.length} topics.`);
console.log("  by kind:", Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join("  "));
console.log(`  quiz-eligible: ${quizEligible} (${siblingFilled} from sibling rows)`);
console.log(`  suppressed by the well-formed gate: ${suppressed}`);
console.log(`  thin topics (<3 items): ${thin.length}`);
for (const t of thin) console.log(`    ${t.id} (${t.count})`);
