import { readFileSync } from "node:fs";

const topics = JSON.parse(readFileSync("docs/curriculum/baseline/topics.json", "utf8")).topics;
const paths = process.argv.slice(2);
const maps = (paths.length ? paths : ["src/features/baseline/model/reviewedPlans.json"]).flatMap((path) => JSON.parse(readFileSync(path, "utf8")));
const compact = (text) => text.replace(/\s+/g, " ").trim();
const tokens = (text) => compact(text).split(" ").sort().join(" ");
const failures = [];
const keys = new Set();
for (const map of maps) {
  const key = `${map.topicId}:${map.page}`;
  if (keys.has(key)) failures.push(`${key}: duplicate map`);
  keys.add(key);
  const source = topics.find((topic) => topic.id === map.topicId)?.fragments.find((fragment) => fragment.page === map.page);
  if (!source) { failures.push(`${key}: no source`); continue; }
  const lines = source.text.split("\n");
  const covered = [];
  const rangeText = ([start, end]) => lines.slice(start, end + 1).join(" ");
  const cover = ([start, end]) => { for (let i = start; i <= end; i++) covered.push(i); };
  const item = (value) => { if (Array.isArray(value)) cover(value); else { cover(value.range); (value.children ?? []).forEach(item); } };
  if (map.titleRange) cover(map.titleRange);
  for (const block of map.blocks) {
    if (!block) { failures.push(`${key}: empty block`); continue; }
    if (block.kind === "list") block.items.forEach(item); else cover(block.range);
    if (block.kind === "table") {
      const sourceTokens = tokens(rangeText(block.range));
      const tableTokens = tokens([...block.headers, ...block.rows.flat()].join(" "));
      if (sourceTokens !== tableTokens) failures.push(`${key}: table token mismatch range ${block.range}`);
      if (block.rows.some((row) => row.length !== (block.headers.length || block.rows[0].length))) failures.push(`${key}: unequal table columns`);
    }
  }
  const missing = lines.flatMap((line, index) => line.trim() && !covered.includes(index) ? [index] : []);
  const duplicates = covered.filter((line, index) => covered.indexOf(line) !== index);
  if (missing.length) failures.push(`${key}: missing lines ${missing}`);
  if (duplicates.length) failures.push(`${key}: overlapping lines ${duplicates}`);
  if (covered.some((line, index) => index > 0 && line < covered[index - 1])) failures.push(`${key}: source order changed`);
}
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
else console.log(`Reading maps passed: ${maps.length} fragments, source coverage/order and table tokens preserved.`);
