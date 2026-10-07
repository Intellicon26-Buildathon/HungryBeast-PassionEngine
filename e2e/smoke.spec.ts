import { test, expect } from "@playwright/test";

// Production smoke path: the public surfaces must render and link through.

test("landing page renders the product promise", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Passion Discovery Engine/i);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("career catalogue shows the live simulation and links to detail", async ({ page }) => {
  await page.goto("/careers");
  await expect(page.getByText("Product Manager").first()).toBeVisible();

  await page.goto("/careers/product-manager");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("404 route renders the not-found page", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.locator("text=404").first()).toBeVisible();
});
