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
const serverUrl = new URL(baseUrl);
const serverPort = serverUrl.port || (serverUrl.protocol === "https:" ? "443" : "80");

async function canReachServer() {
  try {
    const response = await fetch(baseUrl, { method: "HEAD" });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(child) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Lighthouse server exited early with code ${child.exitCode}`);
    }
    if (await canReachServer()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Lighthouse server at ${baseUrl}`);
}

async function ensureServer() {
  if (await canReachServer()) return null;

  const child = spawn("npm", ["run", "start", "--", "--port", serverPort], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: serverPort },
  });

  child.stdout.on("data", (chunk) => process.stderr.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  await waitForServer(child);
  return child;
}

function stopServer(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  child.kill("SIGTERM");
}

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

const server = await ensureServer();
try {
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
    process.exitCode = 1;
  }
} finally {
  stopServer(server);
}
