#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "src", "content", "data");
const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".json"));
const allowedBlockTypes = new Set([
  "text",
  "heading",
  "list",
  "qa",
  "hierarchy",
  "law",
  "numbers",
  "reference",
  "ops_context",
  "traps",
  "ipc_questions",
  "airline_questions",
  "scenario",
]);
const moduleIds = new Set();
const errors = [];
const warnings = [];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

for (const file of files) {
  const fullPath = path.join(dataDir, file);
  let section;
  try {
    section = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }

  if (!isNonEmptyString(section.version)) errors.push(`${file}: missing section.version`);
  if (!isNonEmptyString(section.sectionId)) errors.push(`${file}: missing section.sectionId`);
  if (!Array.isArray(section.categories)) errors.push(`${file}: categories must be an array`);
  if (!Array.isArray(section.modules)) errors.push(`${file}: modules must be an array`);
  if (!Array.isArray(section.modules)) continue;

  const categoryIds = new Set((section.categories ?? []).map((category) => category.id));
  const idsInSection = new Set();

  for (const moduleItem of section.modules) {
    const label = `${file}:${moduleItem.id ?? "<missing-id>"}`;
    if (!isNonEmptyString(moduleItem.id)) errors.push(`${label}: missing module.id`);
    if (moduleItem.id && moduleIds.has(moduleItem.id)) errors.push(`${label}: duplicate module id across sections`);
    if (moduleItem.id && idsInSection.has(moduleItem.id)) errors.push(`${label}: duplicate module id in section`);
    if (moduleItem.id) {
      moduleIds.add(moduleItem.id);
      idsInSection.add(moduleItem.id);
    }
    if (!isNonEmptyString(moduleItem.title)) errors.push(`${label}: missing title`);
    if (!categoryIds.has(moduleItem.categoryId)) errors.push(`${label}: categoryId does not match any category`);
    if (!Array.isArray(moduleItem.tags)) errors.push(`${label}: tags must be an array`);
    if (!Array.isArray(moduleItem.content) || moduleItem.content.length === 0) errors.push(`${label}: content must be a non-empty array`);
    if (!Array.isArray(moduleItem.refs) || moduleItem.refs.length === 0) errors.push(`${label}: refs must include at least one source or explicit provenance note`);
    for (const [refIndex, ref] of (moduleItem.refs ?? []).entries()) {
      const refLabel = `${label}:refs[${refIndex}]`;
      if (!isNonEmptyString(ref.source)) errors.push(`${refLabel}: source missing`);
      if (!isNonEmptyString(ref.part) && !isNonEmptyString(ref.chapter) && !isNonEmptyString(ref.section) && !isNonEmptyString(ref.note) && !isNonEmptyString(ref.url)) {
        errors.push(`${refLabel}: include part, chapter, section, note, or url so the provenance is checkable`);
      }
    }
    for (const [index, block] of (moduleItem.content ?? []).entries()) {
      const blockLabel = `${label}:content[${index}]`;
      if (!allowedBlockTypes.has(block.type)) errors.push(`${blockLabel}: unknown block type ${block.type}`);
      if (block.type === "qa") {
        if (!isNonEmptyString(block.question)) errors.push(`${blockLabel}: qa.question missing`);
        if (!isNonEmptyString(block.answer)) errors.push(`${blockLabel}: qa.answer missing`);
        if (block.distractors && block.distractors.length !== 3) errors.push(`${blockLabel}: distractors must contain exactly 3 items`);
      }
      if (["law", "numbers", "reference", "ops_context", "traps", "ipc_questions", "airline_questions", "scenario"].includes(block.type)) {
        if (!Array.isArray(block.content)) errors.push(`${blockLabel}: content must be an array`);
      }
      if (block.type === "list" && (!Array.isArray(block.items) || block.items.length === 0)) {
        errors.push(`${blockLabel}: list.items must be a non-empty array`);
      }
    }
  }

  for (const category of section.categories ?? []) {
    for (const moduleId of category.moduleIds ?? []) {
      if (!idsInSection.has(moduleId)) errors.push(`${file}: category ${category.id} references missing module ${moduleId}`);
    }
  }
}

// ─── Radio scenarios ──────────────────────────────────────────────────────
const radioDir = path.join(dataDir, "radio");
const allowedSpeakers = new Set(["pilot", "atc"]);
const allowedStations = new Set([
  "ground",
  "tower",
  "delivery",
  "approach",
  "departure",
  "centre",
  "info",
  "unicom",
]);
const allowedOptionIds = new Set(["A", "B", "C", "D"]);
const allowedFlightRules = new Set(["IFR", "VFR"]);
const realSourcePattern = /(AIP|MATS|ERSA|CASR|Part\s*\d+|CAO|CAAP)/i;
const scenarioIds = new Set();
let scenarioCount = 0;

if (fs.existsSync(radioDir)) {
  const radioFiles = fs
    .readdirSync(radioDir)
    .filter((file) => file.endsWith(".json"));

  for (const file of radioFiles) {
    const fullPath = path.join(radioDir, file);
    let scenario;
    try {
      scenario = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (error) {
      errors.push(`radio/${file}: invalid JSON (${error.message})`);
      continue;
    }
    scenarioCount += 1;
    const sLabel = `radio/${file}`;

    if (!isNonEmptyString(scenario.version)) errors.push(`${sLabel}: missing version`);
    if (!isNonEmptyString(scenario.scenarioId)) {
      errors.push(`${sLabel}: missing scenarioId`);
    } else if (scenarioIds.has(scenario.scenarioId)) {
      errors.push(`${sLabel}: duplicate scenarioId ${scenario.scenarioId}`);
    } else {
      scenarioIds.add(scenario.scenarioId);
    }
    if (!isNonEmptyString(scenario.title)) errors.push(`${sLabel}: missing title`);

    if (!scenario.briefing || typeof scenario.briefing !== "object") {
      errors.push(`${sLabel}: briefing must be an object`);
    } else {
      if (!isNonEmptyString(scenario.briefing.callsign)) errors.push(`${sLabel}: briefing.callsign missing`);
      if (!isNonEmptyString(scenario.briefing.summary)) errors.push(`${sLabel}: briefing.summary missing`);
      if (!allowedFlightRules.has(scenario.briefing.flightRules)) {
        errors.push(`${sLabel}: briefing.flightRules must be IFR or VFR`);
      }
    }

    if (!Array.isArray(scenario.legs) || scenario.legs.length === 0) {
      errors.push(`${sLabel}: legs must be a non-empty array`);
    } else {
      const legIds = new Set();
      const questionIds = new Set();
      let hasQuestion = false;
      for (const [i, leg] of scenario.legs.entries()) {
        const legLabel = `${sLabel}:legs[${i}]`;
        if (!isNonEmptyString(leg.id)) errors.push(`${legLabel}: missing id`);
        else if (legIds.has(leg.id)) errors.push(`${legLabel}: duplicate leg id ${leg.id}`);
        else legIds.add(leg.id);

        if (!leg.transmission || typeof leg.transmission !== "object") {
          errors.push(`${legLabel}: transmission must be an object`);
          continue;
        }
        if (!allowedSpeakers.has(leg.transmission.speaker)) {
          errors.push(`${legLabel}: transmission.speaker must be pilot or atc`);
        }
        if (leg.transmission.station && !allowedStations.has(leg.transmission.station)) {
          errors.push(`${legLabel}: transmission.station ${leg.transmission.station} not allowed`);
        }
        if (!isNonEmptyString(leg.transmission.text)) {
          errors.push(`${legLabel}: transmission.text missing`);
        }

        if (leg.question !== undefined) {
          hasQuestion = true;
          const qLabel = `${legLabel}:question`;
          const challenge = leg.question;
          if (challenge.kind !== "mcq" && challenge.kind !== "readback" && challenge.kind !== "spoken") {
            errors.push(`${qLabel}: kind must be "mcq", "readback", or "spoken"`);
            continue;
          }
          if (!isNonEmptyString(challenge.id)) errors.push(`${qLabel}: missing id`);
          else if (questionIds.has(challenge.id)) errors.push(`${qLabel}: duplicate question id ${challenge.id}`);
          else questionIds.add(challenge.id);
          if (!isNonEmptyString(challenge.prompt)) errors.push(`${qLabel}: prompt missing`);

          if (challenge.kind === "mcq") {
            if (!Array.isArray(challenge.options) || challenge.options.length !== 4) {
              errors.push(`${qLabel}: options must be exactly 4`);
            } else {
              const seenOptionIds = new Set();
              for (const [oi, option] of challenge.options.entries()) {
                const oLabel = `${qLabel}:options[${oi}]`;
                if (!allowedOptionIds.has(option.id)) errors.push(`${oLabel}: id must be A, B, C, or D`);
                else if (seenOptionIds.has(option.id)) errors.push(`${oLabel}: duplicate option id ${option.id}`);
                else seenOptionIds.add(option.id);
                if (!isNonEmptyString(option.text)) errors.push(`${oLabel}: text missing`);
              }
            }
            if (!allowedOptionIds.has(challenge.correctOptionId)) {
              errors.push(`${qLabel}: correctOptionId must be A, B, C, or D`);
            } else if (Array.isArray(challenge.options)) {
              const matches = challenge.options.some((o) => o.id === challenge.correctOptionId);
              if (!matches) errors.push(`${qLabel}: correctOptionId does not match any option`);
            }
          } else if (challenge.kind === "readback") {
            if (!Array.isArray(challenge.chips) || challenge.chips.length < 2) {
              errors.push(`${qLabel}: readback chips must be a non-trivial array (at least 2)`);
            } else {
              const seenChipIds = new Set();
              for (const [ci, chip] of challenge.chips.entries()) {
                const cLabel = `${qLabel}:chips[${ci}]`;
                if (!isNonEmptyString(chip.id)) errors.push(`${cLabel}: id missing`);
                else if (seenChipIds.has(chip.id)) errors.push(`${cLabel}: duplicate chip id ${chip.id}`);
                else seenChipIds.add(chip.id);
                if (!isNonEmptyString(chip.text)) errors.push(`${cLabel}: text missing`);
              }
              if (!Array.isArray(challenge.requiredIds) || challenge.requiredIds.length === 0) {
                errors.push(`${qLabel}: requiredIds must be a non-empty array`);
              } else {
                const chipIdSet = new Set(challenge.chips.map((c) => c.id));
                for (const reqId of challenge.requiredIds) {
                  if (!chipIdSet.has(reqId)) {
                    errors.push(`${qLabel}: required id "${reqId}" does not match any chip`);
                  }
                }
                if (challenge.requiredIds.length >= challenge.chips.length) {
                  errors.push(`${qLabel}: readback must include at least one non-required (distractor) chip`);
                }
              }
            }
          } else {
            // spoken
            if (!isNonEmptyString(challenge.expectedText)) {
              errors.push(`${qLabel}: spoken call must have expectedText (the AIP-standard call)`);
            }
            if (!Array.isArray(challenge.elements) || challenge.elements.length === 0) {
              errors.push(`${qLabel}: spoken call must have a non-empty elements array`);
            } else {
              const seenLabels = new Set();
              let hasRequired = false;
              for (const [ei, element] of challenge.elements.entries()) {
                const eLabel = `${qLabel}:elements[${ei}]`;
                if (!isNonEmptyString(element.label)) errors.push(`${eLabel}: label missing`);
                else if (seenLabels.has(element.label)) errors.push(`${eLabel}: duplicate label "${element.label}"`);
                else seenLabels.add(element.label);
                if (!Array.isArray(element.accept) || element.accept.length === 0) {
                  errors.push(`${eLabel}: accept must be a non-empty array of legal phrasings`);
                } else {
                  for (const [pi, phrase] of element.accept.entries()) {
                    if (!isNonEmptyString(phrase)) {
                      errors.push(`${eLabel}:accept[${pi}]: phrase must be a non-empty string`);
                    }
                  }
                }
                if (typeof element.required !== "boolean") {
                  errors.push(`${eLabel}: required must be a boolean`);
                } else if (element.required) {
                  hasRequired = true;
                }
              }
              if (!hasRequired) {
                errors.push(`${qLabel}: spoken call must declare at least one required element`);
              }
            }
          }
        }
      }
      if (!hasQuestion) {
        errors.push(`${sLabel}: scenario must include at least one pilot leg with a question`);
      }
    }

    if (!Array.isArray(scenario.refs) || scenario.refs.length === 0) {
      errors.push(`${sLabel}: refs must be a non-empty array`);
    } else {
      let hasRealSource = false;
      for (const [ri, ref] of scenario.refs.entries()) {
        const rLabel = `${sLabel}:refs[${ri}]`;
        if (!isNonEmptyString(ref.source)) {
          errors.push(`${rLabel}: source missing`);
          continue;
        }
        if (/unverified/i.test(ref.source)) {
          errors.push(`${rLabel}: placeholder source "${ref.source}" not allowed for radio scenarios`);
        }
        if (realSourcePattern.test(ref.source)) hasRealSource = true;
        if (
          !isNonEmptyString(ref.part) &&
          !isNonEmptyString(ref.chapter) &&
          !isNonEmptyString(ref.section) &&
          !isNonEmptyString(ref.note) &&
          !isNonEmptyString(ref.url)
        ) {
          errors.push(`${rLabel}: include part, chapter, section, note, or url so the provenance is checkable`);
        }
      }
      if (!hasRealSource) {
        errors.push(`${sLabel}: at least one ref must cite AIP / MATS / ERSA / CASR / Part 61 / CAO / CAAP`);
      }
    }
  }
}

// ─── Radio drill cards ────────────────────────────────────────────────────
const drillDir = path.join(dataDir, "radio-drill");
const allowedPhases = new Set([
  "pre-departure",
  "departure",
  "enroute",
  "arrival",
  "final",
  "non-normal",
]);
const drillIds = new Set();
let drillCount = 0;

function validateChallenge(challenge, qLabel) {
  if (challenge.kind !== "mcq" && challenge.kind !== "readback" && challenge.kind !== "spoken") {
    errors.push(`${qLabel}: kind must be "mcq", "readback", or "spoken"`);
    return;
  }
  if (!isNonEmptyString(challenge.id)) errors.push(`${qLabel}: missing id`);
  if (!isNonEmptyString(challenge.prompt)) errors.push(`${qLabel}: prompt missing`);

  if (challenge.kind === "spoken") {
    if (!isNonEmptyString(challenge.expectedText)) {
      errors.push(`${qLabel}: spoken call must have expectedText`);
    }
    if (!Array.isArray(challenge.elements) || challenge.elements.length === 0) {
      errors.push(`${qLabel}: spoken call must have a non-empty elements array`);
    } else {
      const seenLabels = new Set();
      let hasRequired = false;
      for (const [ei, element] of challenge.elements.entries()) {
        const eLabel = `${qLabel}:elements[${ei}]`;
        if (!isNonEmptyString(element.label)) errors.push(`${eLabel}: label missing`);
        else if (seenLabels.has(element.label)) errors.push(`${eLabel}: duplicate label "${element.label}"`);
        else seenLabels.add(element.label);
        if (!Array.isArray(element.accept) || element.accept.length === 0) {
          errors.push(`${eLabel}: accept must be a non-empty array`);
        }
        if (typeof element.required !== "boolean") {
          errors.push(`${eLabel}: required must be a boolean`);
        } else if (element.required) {
          hasRequired = true;
        }
      }
      if (!hasRequired) {
        errors.push(`${qLabel}: spoken call must declare at least one required element`);
      }
    }
  }
}

if (fs.existsSync(drillDir)) {
  const drillFiles = fs.readdirSync(drillDir).filter((file) => file.endsWith(".json"));
  for (const file of drillFiles) {
    const fullPath = path.join(drillDir, file);
    let card;
    try {
      card = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (error) {
      errors.push(`radio-drill/${file}: invalid JSON (${error.message})`);
      continue;
    }
    drillCount += 1;
    const dLabel = `radio-drill/${file}`;
    if (!isNonEmptyString(card.version)) errors.push(`${dLabel}: missing version`);
    if (!isNonEmptyString(card.drillId)) errors.push(`${dLabel}: missing drillId`);
    else if (drillIds.has(card.drillId)) errors.push(`${dLabel}: duplicate drillId ${card.drillId}`);
    else drillIds.add(card.drillId);
    if (!allowedPhases.has(card.phase)) errors.push(`${dLabel}: phase must be one of pre-departure / departure / enroute / arrival / final / non-normal`);
    if (!isNonEmptyString(card.title)) errors.push(`${dLabel}: missing title`);
    if (!card.briefing || typeof card.briefing !== "object") {
      errors.push(`${dLabel}: briefing must be an object`);
    } else {
      if (!isNonEmptyString(card.briefing.callsign)) errors.push(`${dLabel}: briefing.callsign missing`);
      if (!isNonEmptyString(card.briefing.summary)) errors.push(`${dLabel}: briefing.summary missing`);
      if (!allowedFlightRules.has(card.briefing.flightRules)) {
        errors.push(`${dLabel}: briefing.flightRules must be IFR or VFR`);
      }
    }
    if (!card.challenge || typeof card.challenge !== "object") {
      errors.push(`${dLabel}: challenge must be an object`);
    } else {
      validateChallenge(card.challenge, `${dLabel}:challenge`);
    }
    if (!Array.isArray(card.refs) || card.refs.length === 0) {
      errors.push(`${dLabel}: refs must be a non-empty array`);
    } else {
      let hasRealSource = false;
      for (const [ri, ref] of card.refs.entries()) {
        const rLabel = `${dLabel}:refs[${ri}]`;
        if (!isNonEmptyString(ref.source)) {
          errors.push(`${rLabel}: source missing`);
          continue;
        }
        if (/unverified/i.test(ref.source)) {
          errors.push(`${rLabel}: placeholder source "${ref.source}" not allowed for drill cards`);
        }
        if (realSourcePattern.test(ref.source)) hasRealSource = true;
      }
      if (!hasRealSource) {
        errors.push(`${dLabel}: at least one ref must cite AIP / MATS / ERSA / CASR / Part 61 / CAO / CAAP`);
      }
    }
  }
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR ${error}`).join("\n"));
  process.exit(1);
}
console.log(
  `Content check passed: ${files.length} files, ${moduleIds.size} modules, ${scenarioCount} radio scenario${scenarioCount === 1 ? "" : "s"}, ${drillCount} drill card${drillCount === 1 ? "" : "s"}`,
);
