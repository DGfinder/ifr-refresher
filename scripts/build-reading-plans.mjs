import { readFileSync, writeFileSync } from "node:fs";

const inputs = ["terra-reading-maps", "luna-reading-maps", "terra-second-half-corrections"];
const maps = new Map();
for (const name of inputs) for (const plan of JSON.parse(readFileSync(`docs/reviews/${name}.json`, "utf8"))) maps.set(`${plan.topicId}:${plan.page}`, plan);
const block = (kind, start, end = start) => ({ kind, range: [start, end] });
const list = (start, end) => ({ kind: "list", items: Array.from({ length: end - start + 1 }, (_, index) => [start + index, start + index]) });

// Root-reviewed source page 41: the table expresses four groups, with no numerical columns.
maps.set("approach-types:41", { topicId: "approach-types", page: 41, titleRange: [0, 0], blocks: [
  block("reference", 1, 2), block("heading", 3, 4), list(5, 9),
  block("heading", 10, 11), list(12, 16), block("heading", 17, 18), list(19, 20),
  block("heading", 21, 23), list(24, 30),
] });
// Root-reviewed source page 51: retain the shared qualifying heading before the day/night rows.
maps.set("approach-visual-atc:51", { topicId: "approach-visual-atc", page: 51, titleRange: [0, 0], blocks: [
  block("reference", 1, 2), block("heading", 3),
  { kind: "table", range: [4, 16], headers: ["Day", "Night"], sharedRows: [0], rows: [
    ["may be issued when...", ""], ["Within 30NM", "Within 30NM"],
    ["Continuous visual reference to ground or water", "Continuous visual reference to ground or water"],
    ["VIS 5000M", "VIS 5000M"], ["-", "If being vectored, assigned MVA and given heading or tracking instructions to intercept final or to position within circling area"],
  ] },
] });
for (const plan of maps.values()) {
  if (plan.topicId.startsWith("phraseology-")) for (const item of plan.blocks) if (item.kind === "paragraph") item.kind = "call";
}
writeFileSync("src/features/baseline/model/reviewedPlans.json", JSON.stringify([...maps.values()], null, 2) + "\n");
console.log(`Built ${maps.size} reading plans; three original pilot plans remain in the renderer.`);
