import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /pwa-offline\.spec\.ts/,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3103",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run start -- --port 3103",
    url: "http://127.0.0.1:3103",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
