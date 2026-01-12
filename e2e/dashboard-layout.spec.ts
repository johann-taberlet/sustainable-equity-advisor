import { expect, test } from "@playwright/test";

/**
 * Dashboard Layout E2E Tests
 * Tests for the new sidebar-based dashboard architecture
 */

test.describe("Dashboard Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Sidebar Navigation", () => {
    test("sidebar renders with all navigation items", async ({ page }) => {
      const sidebar = page.getByTestId("dashboard-sidebar");
      await expect(sidebar).toBeVisible();

      // Check all nav items exist
      const navItems = [
        "Dashboard",
        "Holdings",
        "ESG",
        "Screening",
        "Watchlist",
        "Settings",
      ];

      for (const item of navItems) {
        const navButton = sidebar.locator(`button:has-text("${item}")`);
        await expect(navButton).toBeVisible();
      }
    });

    test("clicking nav item changes active section", async ({ page }) => {
      // Click on Holdings
      await page.getByTestId("nav-holdings").click();
      await expect(page.getByTestId("holdings-content")).toBeVisible();

      // Click on ESG
      await page.getByTestId("nav-esg").click();
      await expect(page.getByTestId("esg-content")).toBeVisible();

      // Click on Dashboard
      await page.getByTestId("nav-dashboard").click();
      await expect(page.getByTestId("portfolio-content")).toBeVisible();
    });

    test("active nav item has visual indicator", async ({ page }) => {
      // Dashboard should be active by default
      const dashboardBtn = page.getByTestId("nav-dashboard");
      await expect(dashboardBtn).toHaveAttribute("aria-current", "page");

      // Click Holdings
      await page.getByTestId("nav-holdings").click();

      // Holdings should now be active
      const holdingsBtn = page.getByTestId("nav-holdings");
      await expect(holdingsBtn).toHaveAttribute("aria-current", "page");

      // Dashboard should no longer be active
      await expect(dashboardBtn).not.toHaveAttribute("aria-current", "page");
    });
  });

  test.describe("Header", () => {
    test("header displays portfolio selector", async ({ page }) => {
      const header = page.getByTestId("dashboard-header");
      await expect(header).toBeVisible();

      const selector = page.getByTestId("portfolio-selector");
      await expect(selector).toBeVisible();
      await expect(selector).toContainText("Demo Portfolio");
    });

    test("header contains theme toggle", async ({ page }) => {
      const themeToggle = page.getByTestId("theme-toggle");
      await expect(themeToggle).toBeVisible();
    });

    test("header contains user menu", async ({ page }) => {
      const userMenu = page.getByTestId("user-menu");
      await expect(userMenu).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("sidebar collapses on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Sidebar should not be visible initially
      const sidebar = page.getByTestId("dashboard-sidebar");
      await expect(sidebar).not.toBeInViewport();

      // Menu button should be visible
      const menuButton = page.locator("button[aria-label='Open sidebar']");
      await expect(menuButton).toBeVisible();

      // Click to open sidebar
      await menuButton.click();

      // Sidebar should now be visible
      await expect(sidebar).toBeVisible();
    });

    test("sidebar overlay closes on click", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open sidebar
      await page.locator("button[aria-label='Open sidebar']").click();

      const sidebar = page.getByTestId("dashboard-sidebar");
      await expect(sidebar).toBeVisible();

      // Click backdrop to close
      await page.locator(".bg-black\\/50").click();

      // Sidebar should be hidden again
      await expect(sidebar).not.toBeInViewport();
    });

    test("content displays correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const main = page.getByTestId("dashboard-main");
      await expect(main).toBeVisible();

      const portfolioContent = page.getByTestId("portfolio-content");
      await expect(portfolioContent).toBeVisible();
    });

    test("content displays correctly on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      // Sidebar should be visible
      const sidebar = page.getByTestId("dashboard-sidebar");
      await expect(sidebar).toBeVisible();

      // Main content should be visible
      const main = page.getByTestId("dashboard-main");
      await expect(main).toBeVisible();
    });

    test("no horizontal scroll on any viewport", async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1280, height: 800 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100);

        const scrollWidth = await page.evaluate(
          () => document.body.scrollWidth,
        );
        const clientWidth = await page.evaluate(
          () => document.body.clientWidth,
        );

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      }
    });
  });

  test.describe("Dashboard Content", () => {
    test("dashboard shows portfolio summary", async ({ page }) => {
      const portfolioSummary = page.getByTestId("portfolio-summary");
      await expect(portfolioSummary).toBeVisible();
    });

    test("dashboard shows portfolio value", async ({ page }) => {
      const portfolioValue = page.getByTestId("portfolio-value");
      await expect(portfolioValue).toBeVisible();
      await expect(portfolioValue).toContainText("CHF");
    });

    test("dashboard shows portfolio change", async ({ page }) => {
      const portfolioChange = page.getByTestId("portfolio-change");
      await expect(portfolioChange).toBeVisible();
      await expect(portfolioChange).toContainText("%");
    });

    test("dashboard shows ESG score", async ({ page }) => {
      const portfolioESG = page.getByTestId("portfolio-esg");
      await expect(portfolioESG).toBeVisible();
      await expect(portfolioESG).toContainText("/100");
    });

    test("dashboard shows allocation chart", async ({ page }) => {
      const allocationChart = page.getByTestId("allocation-chart");
      await expect(allocationChart).toBeVisible();
    });

    test("dashboard shows ESG breakdown", async ({ page }) => {
      const esgBreakdown = page.getByTestId("esg-breakdown");
      await expect(esgBreakdown).toBeVisible();
    });
  });

  test.describe("Holdings Section", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId("nav-holdings").click();
    });

    test("holdings section shows table", async ({ page }) => {
      const holdingsList = page.getByTestId("holdings-list");
      await expect(holdingsList).toBeVisible();
    });

    test("holdings table has multiple rows", async ({ page }) => {
      const rows = page.getByTestId("holding-row");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test("holdings show ESG scores", async ({ page }) => {
      const esgScores = page.getByTestId("holding-esg-score");
      const count = await esgScores.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
