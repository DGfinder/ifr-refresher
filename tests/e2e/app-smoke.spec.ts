import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "IFR Quick Study" },
  { path: "/study", heading: "IFR QUICK STUDY" },
  { path: "/flashcard", heading: "Study mode" },
  { path: "/quiz", heading: "CHOOSE MODE" },
  { path: "/insights", heading: "Insights" },
];

test.describe("app route smoke", () => {
  for (const route of routes) {
    test(`${route.path} renders without runtime errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto(route.path);
      await expect(page.getByText(route.heading).first()).toBeVisible();
      await expect(page.getByText(/Unhandled Runtime Error|Recoverable Error|Hydration failed/i)).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
});
