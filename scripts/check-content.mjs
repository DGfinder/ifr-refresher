#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "src", "data");
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
    if (!Array.isArray(moduleItem.refs) || moduleItem.refs.length === 0) warnings.push(`${label}: no refs supplied`);
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

for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Content check passed: ${files.length} files, ${moduleIds.size} modules`);
