import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Lighthouse gate wiring", () => {
  it("runs Lighthouse from a self-contained production server harness", () => {
    const script = readFileSync("scripts/run-lighthouse.mjs", "utf8");

    expect(script).toContain("ensureServer");
    expect(script).toContain('spawn("npm", ["run", "start"');
  });

  it("is enforced by CI, not only documented for local manual use", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

    expect(workflow).toContain("npm run lighthouse");
  });
});
