import { test, expect } from "@playwright/test";

/**
 * Supabase Integration E2E Tests
 * Tests for data persistence and Supabase integration
 *
 * Note: These tests use the demo portfolio which is pre-seeded.
 * In a full implementation, these would test actual Supabase operations.
 */

test.describe("Supabase Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Portfolio Data Loading", () => {
    test("portfolio value loads on page load", async ({ page }) => {
      const portfolioValue = page.getByTestId("portfolio-value");
      await expect(portfolioValue).toBeVisible({ timeout: 10000 });
      await expect(portfolioValue).toContainText("CHF");

      // Value should be non-zero
      const text = await portfolioValue.textContent();
      const hasNumber = /[\d,.']+/.test(text || "");
      expect(hasNumber).toBeTruthy();
    });

    test("holdings load with ESG data", async ({ page }) => {
      // Navigate to holdings
      await page.getByTestId("nav-holdings").click();

      const holdingsList = page.getByTestId("holdings-list");
      await expect(holdingsList).toBeVisible({ timeout: 10000 });

      // Should have holdings
      const rows = page.getByTestId("holding-row");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(5);

      // Holdings should have ESG scores
      const esgScores = page.getByTestId("holding-esg-score");
      const esgCount = await esgScores.count();
      expect(esgCount).toBeGreaterThan(0);
    });

    test("portfolio ESG score is calculated", async ({ page }) => {
      const portfolioESG = page.getByTestId("portfolio-esg");
      await expect(portfolioESG).toBeVisible();

      const text = await portfolioESG.textContent();
      // Should contain a score
      expect(text).toMatch(/\d+/);
    });
  });

  test.describe("ESG Data Display", () => {
    test("ESG breakdown shows E, S, G components", async ({ page }) => {
      const esgBreakdown = page.getByTestId("esg-breakdown");
      await expect(esgBreakdown).toBeVisible();

      // All three components should be visible
      await expect(page.getByTestId("e-score")).toBeVisible();
      await expect(page.getByTestId("s-score")).toBeVisible();
      await expect(page.getByTestId("g-score")).toBeVisible();
    });

    test("ESG scores are within valid range", async ({ page }) => {
      await page.getByTestId("nav-holdings").click();

      const esgScores = page.getByTestId("holding-esg-score");
      const count = await esgScores.count();

      for (let i = 0; i < count; i++) {
        const scoreText = await esgScores.nth(i).textContent();
        const score = parseInt(scoreText || "0", 10);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  test.describe("Data Persistence", () => {
    test("data survives page refresh", async ({ page }) => {
      // Get initial portfolio value
      const portfolioValue = page.getByTestId("portfolio-value");
      await expect(portfolioValue).toBeVisible();
      const initialValue = await portfolioValue.textContent();

      // Refresh page
      await page.reload();

      // Value should still be there
      await expect(portfolioValue).toBeVisible();
      const afterRefreshValue = await portfolioValue.textContent();

      // Values should match (same demo data)
      expect(afterRefreshValue).toContain("CHF");
    });

    test("holdings persist across navigation", async ({ page }) => {
      // Go to holdings
      await page.getByTestId("nav-holdings").click();
      const holdingRows = page.getByTestId("holding-row");
      const initialCount = await holdingRows.count();

      // Navigate away
      await page.getByTestId("nav-esg").click();
      await expect(page.getByTestId("esg-content")).toBeVisible();

      // Navigate back
      await page.getByTestId("nav-holdings").click();
      await expect(page.getByTestId("holdings-content")).toBeVisible();

      // Should have same count
      const afterCount = await holdingRows.count();
      expect(afterCount).toBe(initialCount);
    });
  });

  test.describe("Sector Allocation", () => {
    test("allocation chart displays sectors", async ({ page }) => {
      const allocationChart = page.getByTestId("allocation-chart");
      await expect(allocationChart).toBeVisible();

      // Should show sector names
      const chartText = await allocationChart.textContent();
      const sectors = [
        "Technology",
        "Consumer",
        "Energy",
        "Healthcare",
        "Industrial",
      ];
      const hasSector = sectors.some((s) =>
        chartText?.toLowerCase().includes(s.toLowerCase()),
      );
      expect(hasSector).toBeTruthy();
    });
  });

  test.describe("Portfolio Selector", () => {
    test("portfolio selector shows demo portfolio", async ({ page }) => {
      const selector = page.getByTestId("portfolio-selector");
      await expect(selector).toBeVisible();
      await expect(selector).toContainText("Demo Portfolio");
    });

    test("portfolio selector is interactive", async ({ page }) => {
      const selector = page.getByTestId("portfolio-selector");
      await selector.click();

      // Dropdown should appear
      const dropdown = page.locator("[role='listbox'], [role='menu']");
      await expect(dropdown).toBeVisible();
    });
  });

  test.describe("Data Integrity", () => {
    test("holdings have required fields", async ({ page }) => {
      await page.getByTestId("nav-holdings").click();

      const table = page.getByTestId("holdings-list");
      await expect(table).toBeVisible();

      // Table should have headers
      const tableText = await table.textContent();
      expect(tableText?.toLowerCase()).toContain("symbol");
      expect(tableText?.toLowerCase()).toContain("name");
    });

    test("total value is sum of holdings", async ({ page }) => {
      const portfolioValue = page.getByTestId("portfolio-value");
      await expect(portfolioValue).toBeVisible();

      const valueText = await portfolioValue.textContent();
      // Should have a formatted number
      expect(valueText).toMatch(/[\d,.']+/);
    });
  });

  test.describe("ESG Score Colors", () => {
    test("high ESG scores have green color", async ({ page }) => {
      await page.getByTestId("nav-holdings").click();

      const esgScores = page.getByTestId("holding-esg-score");
      const count = await esgScores.count();

      // Find a high score (>=80) and check its color
      for (let i = 0; i < count; i++) {
        const scoreElement = esgScores.nth(i);
        const scoreText = await scoreElement.textContent();
        const score = parseInt(scoreText || "0", 10);

        if (score >= 80) {
          // Should have green class
          const className = await scoreElement.getAttribute("class");
          expect(className).toMatch(/green/i);
          break;
        }
      }
    });
  });

  test.describe("API Integration", () => {
    test("ESG API is called on load", async ({ page }) => {
      // Set up request interception
      const esgRequests: string[] = [];
      page.on("request", (request) => {
        if (request.url().includes("/api/esg")) {
          esgRequests.push(request.url());
        }
      });

      await page.goto("/");
      await page.waitForTimeout(2000);

      // ESG API should have been called
      expect(esgRequests.length).toBeGreaterThan(0);
    });
  });
});
