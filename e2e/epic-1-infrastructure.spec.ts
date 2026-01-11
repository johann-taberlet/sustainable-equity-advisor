import { test, expect } from "@playwright/test";

/**
 * Epic 1: Core Infrastructure
 * Beads ID: a2ui-zex
 *
 * Tasks covered:
 * - 1.4 Environment configuration (a2ui-u1d)
 * - 1.5 Dark/Light theme (a2ui-srz)
 * - 1.6 Tab navigation layout (a2ui-nwp)
 * - 1.8 Vercel deployment (a2ui-0ci)
 */

test.describe("Epic 1: Core Infrastructure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Task 1.4: Environment configuration
  // Acceptance: App loads without env errors
  test("app loads without environment errors", async ({ page }) => {
    // No error messages about missing env vars
    await expect(page.locator("body")).not.toContainText("NEXT_PUBLIC_");
    await expect(page.locator("body")).not.toContainText("undefined");
    await expect(page.locator("body")).not.toContainText("Environment");

    // Page has proper title
    await expect(page).toHaveTitle(/Montblanc|Sustainable|Equity/i);
  });

  // Task 1.5: Dark/Light theme
  // Acceptance: Theme toggle works and persists
  test("theme toggle switches between dark and light", async ({ page }) => {
    const html = page.locator("html");

    // Theme toggle button exists
    const themeToggle = page.getByTestId("theme-toggle");
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialClass = await html.getAttribute("class");
    const isDark = initialClass?.includes("dark");

    // Click toggle
    await themeToggle.click();

    // Theme should change
    if (isDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }
  });

  test("theme preference persists after reload", async ({ page }) => {
    const html = page.locator("html");
    const themeToggle = page.getByTestId("theme-toggle");

    // Toggle to opposite theme
    await themeToggle.click();
    const themeAfterToggle = await html.getAttribute("class");

    // Reload page
    await page.reload();

    // Theme should persist
    const themeAfterReload = await html.getAttribute("class");
    expect(themeAfterReload).toBe(themeAfterToggle);
  });

  // Task 1.6: Navigation layout (updated for sidebar)
  // Acceptance: Navigation items visible and navigable
  test("navigation items are visible", async ({ page }) => {
    // Main nav items should be visible in sidebar
    const sidebar = page.getByTestId("dashboard-sidebar");
    await expect(sidebar).toBeVisible();

    await expect(page.getByTestId("nav-dashboard")).toBeVisible();
    await expect(page.getByTestId("nav-holdings")).toBeVisible();
    await expect(page.getByTestId("nav-esg")).toBeVisible();
    await expect(page.getByTestId("nav-screening")).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Click Holdings nav
    await page.getByTestId("nav-holdings").click();

    // Should show holdings content
    await expect(page.getByTestId("holdings-content")).toBeVisible();

    // Click Screening nav
    await page.getByTestId("nav-screening").click();

    // Should show screening content
    await expect(page.getByTestId("screening-content")).toBeVisible();
  });

  test("layout is responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be collapsible
    const menuButton = page.locator("button[aria-label='Open sidebar']");
    await expect(menuButton).toBeVisible();

    // No horizontal overflow
    const body = page.locator("body");
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });

  // Task 1.8: Vercel deployment
  // Acceptance: App loads without 500 errors
  test("app loads without server errors", async ({ page }) => {
    // No 500 errors
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    // No Next.js error overlay
    await expect(page.locator("#__next-build-error")).not.toBeVisible();
    await expect(page.locator("[data-nextjs-dialog]")).not.toBeVisible();
  });

  test("static assets load correctly", async ({ page }) => {
    // Check that CSS is loaded (body has styles)
    const body = page.locator("body");
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe("");

    // No 404 for main assets (check network)
    const failedRequests: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Filter out expected 404s (like favicon if not set)
    const criticalFailures = failedRequests.filter(
      (r) => !r.includes("favicon") && !r.includes(".map")
    );
    expect(criticalFailures).toHaveLength(0);
  });
});
