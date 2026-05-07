import { expect, test } from "@playwright/test";

test("production PWA reloads study route offline after first load", async ({ page, context }) => {
  await page.goto("/study");
  await expect(page.getByText(/IFR QUICK STUDY/i).first()).toBeVisible();
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("serviceWorker unsupported");
    await navigator.serviceWorker.ready;
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText(/IFR QUICK STUDY/i).first()).toBeVisible();
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText(/IFR QUICK STUDY/i).first()).toBeVisible();
  await context.setOffline(false);
});
