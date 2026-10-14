import { test, expect } from "@playwright/test";

// Production smoke path: the public surfaces must render and link through.

test("landing page renders the product promise", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Passion Discovery Engine/i);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("career catalogue lists playable simulations and links to role details", async ({ page }) => {
  await page.goto("/careers");
  await expect(page.getByText("Product Manager").first()).toBeVisible();
  await expect(page.getByText("Frontend Developer", { exact: true })).toBeVisible();
  await expect(page.getByText("Data Analyst", { exact: true })).toBeVisible();
  await expect(page.getByText("Business Analyst", { exact: true })).toBeVisible();
  await expect(page.getByText("Soon", { exact: true })).toHaveCount(0);

  await page.goto("/careers/frontend-developer");
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.getByText("Fix a course-enrolment page that hides its main action on smaller screens.")).toBeVisible();
  await expect(page.getByText("Typical deliverables")).toBeVisible();
});

test("AI status explains when local replies are in practice mode", async ({ request }) => {
  const response = await request.get("/api/ai/status");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(["gemini", "demo", "unavailable"]).toContain(body.status.mode);
  expect(body.status.model).toBeTruthy();
});

test("frontend simulation completes and produces a role-specific report", async ({ page }) => {
  await page.goto("/careers/frontend-developer");
  await page.getByRole("link", { name: /Start simulation/i }).click();
  await page.getByRole("button", { name: /Enter the workplace/i }).click();

  await expect(page.getByText("Practice replies")).toBeVisible();
  const responseBox = page.locator("textarea");
  const sendButton = page.getByRole("button", { name: /^Send/i });
  const answer = "I would inspect the affected users, reproduce the issue across devices, check keyboard and screen behaviour, then test a small responsive change against a clear acceptance condition.";

  for (let taskIndex = 1; taskIndex <= 4; taskIndex++) {
    await expect(page.getByText(`Task ${taskIndex} of 4`)).toBeVisible();
    await responseBox.fill(answer);
    await sendButton.click();
  }

  await expect(page.getByText("Simulation complete")).toBeVisible();
  await page.getByRole("button", { name: /Finish & get my evaluation/i }).click();
  await expect(page).toHaveURL(/\/evaluation\//);
  await expect(page.getByText("Work evidence at a glance")).toBeVisible();
  await expect(page.getByText("What this job involves")).toBeVisible();
  await expect(page.getByRole("button", { name: /Print or save report as PDF/i })).toBeVisible();
});

test("404 route renders the not-found page", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.locator("text=404").first()).toBeVisible();
});
