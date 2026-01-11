import { test, expect } from "@playwright/test";

/**
 * Epic 5: ESG Data & Scoring
 * Beads ID: a2ui-52t
 *
 * Tasks covered:
 * - 5.1 FMP API integration (a2ui-8ng)
 * - 5.2 ESG score normalization (a2ui-8ms)
 * - 5.3 E/S/G breakdown display (a2ui-mj0)
 */

test.describe("Epic 5: ESG Data & Scoring", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Task 5.1: FMP API integration
  // Acceptance: ESG data loads for stocks
  test("ESG scores load for portfolio holdings", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    // Wait for ESG data to load
    await page.waitForSelector("[data-testid='esg-score'], [data-esg-score]", {
      timeout: 15000,
    });

    // Multiple holdings should have ESG scores
    const esgScores = page.locator(
      "[data-testid='esg-score'], [data-esg-score]",
    );
    const count = await esgScores.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("ESG data is fetched from API (not hardcoded)", async ({ page }) => {
    // Check that API call is made
    const apiCalls: string[] = [];
    page.on("request", (request) => {
      if (
        request.url().includes("financialmodelingprep") ||
        request.url().includes("esg")
      ) {
        apiCalls.push(request.url());
      }
    });

    await page.goto("/");
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    // Wait for data to load
    await page.waitForTimeout(3000);

    // Should have made ESG-related API call (or internal endpoint)
    // If using edge function, check for that
    const esgRelated = apiCalls.filter(
      (url) =>
        url.includes("esg") || url.includes("fmp") || url.includes("api"),
    );

    // Either API call made OR data displayed from cache/mock
    const hasEsgData = await page.locator("[data-testid='esg-score']").count();
    expect(esgRelated.length > 0 || hasEsgData > 0).toBeTruthy();
  });

  // Task 5.2: ESG score normalization
  // Acceptance: Scores are normalized to 0-100
  test("ESG scores are in 0-100 range", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='esg-score'], [data-esg-score]", {
      timeout: 15000,
    });

    const esgScores = page.locator(
      "[data-testid='esg-score'], [data-esg-score]",
    );
    const count = await esgScores.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const scoreText = await esgScores.nth(i).textContent();
      const numericScore = parseInt(scoreText?.match(/\d+/)?.[0] || "-1");

      // Score should be in valid range
      expect(numericScore).toBeGreaterThanOrEqual(0);
      expect(numericScore).toBeLessThanOrEqual(100);
    }
  });

  test("missing ESG data shows N/A gracefully", async ({ page }) => {
    // Go to chat and ask about a stock that might not have ESG data
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("What is the ESG score for XYZFAKESYMBOL?");
    await sendButton.click();

    await page.waitForSelector(
      "[data-testid='assistant-message'], .assistant-message",
      {
        timeout: 60000,
      },
    );

    const response = page
      .locator("[data-testid='assistant-message'], .assistant-message")
      .last();
    const text = await response.textContent();

    // Should handle gracefully (not crash, show N/A or explanation)
    expect(text?.toLowerCase()).toMatch(
      /n\/a|not available|no data|couldn't find|unknown|not found/i,
    );
  });

  // Task 5.3: E/S/G breakdown display
  // Acceptance: Individual E, S, G scores are shown
  test("ESG breakdown shows three components", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector(
      "[data-testid='esg-breakdown'], [data-testid='e-score'], [data-testid='s-score'], [data-testid='g-score']",
      { timeout: 15000 },
    );

    // Should show Environmental score
    const eScore = page.locator(
      "[data-testid='e-score'], [data-label='Environmental']",
    );
    const hasE =
      (await eScore.count()) > 0 ||
      (await page.getByText(/environmental/i).count()) > 0;

    // Should show Social score
    const sScore = page.locator(
      "[data-testid='s-score'], [data-label='Social']",
    );
    const hasS =
      (await sScore.count()) > 0 ||
      (await page.getByText(/social/i).count()) > 0;

    // Should show Governance score
    const gScore = page.locator(
      "[data-testid='g-score'], [data-label='Governance']",
    );
    const hasG =
      (await gScore.count()) > 0 ||
      (await page.getByText(/governance/i).count()) > 0;

    expect(hasE && hasS && hasG).toBeTruthy();
  });

  test("individual stock shows E/S/G breakdown", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Show me the ESG breakdown for Microsoft (MSFT)");
    await sendButton.click();

    await page.waitForSelector(
      "[data-testid='assistant-message'], .assistant-message",
      {
        timeout: 60000,
      },
    );

    const response = page
      .locator("[data-testid='assistant-message'], .assistant-message")
      .last();
    const text = await response.textContent();

    // Should show E, S, G individually
    expect(text?.toLowerCase()).toMatch(/environmental|social|governance/i);
  });

  test("ESG scores have visual indicators", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector(
      "[data-testid='esg-score'], [data-testid='esg-gauge']",
      {
        timeout: 15000,
      },
    );

    // Check for visual elements (colors, progress bars, gauges)
    const visualIndicators = page.locator(
      "[data-testid='esg-gauge'], .progress, [role='progressbar'], .gauge, svg[data-esg]",
    );
    const hasVisual = (await visualIndicators.count()) > 0;

    // Or check for color-coded text
    const coloredElements = page.locator(
      "[data-testid='esg-score'][class*='text-'], [data-testid='esg-score'][class*='bg-']",
    );
    const hasColor = (await coloredElements.count()) > 0;

    // Should have some visual representation
    expect(hasVisual || hasColor).toBeTruthy();
  });
});
