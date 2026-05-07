#!/usr/bin/env node
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const routes = ["/", "/study", "/quiz"];
const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://127.0.0.1:3101";
const budgets = {
  performance: 0.85,
  accessibility: 0.9,
  bestPractices: 0.9,
  seo: 0.85,
};
const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();

function run(route) {
  const url = `${baseUrl}${route}`;
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "lighthouse",
        url,
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox",
        "--output=json",
        "--output-path=stdout",
        "--only-categories=performance,accessibility,best-practices,seo",
      ],
      { stdio: ["ignore", "pipe", "inherit"], env: { ...process.env, CHROME_PATH: chromePath } }
    );
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Lighthouse failed for ${url} with exit ${code}`));
        return;
      }
      const result = JSON.parse(stdout);
      resolve({ route, categories: result.categories });
    });
  });
}

const failures = [];
for (const route of routes) {
  const result = await run(route);
  const scores = {
    performance: result.categories.performance.score,
    accessibility: result.categories.accessibility.score,
    bestPractices: result.categories["best-practices"].score,
    seo: result.categories.seo.score,
  };
  console.log(`${route} ${JSON.stringify(scores)}`);
  for (const [category, minScore] of Object.entries(budgets)) {
    if (scores[category] < minScore) {
      failures.push(`${route} ${category} ${scores[category]} < ${minScore}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
