import { test, expect } from "@playwright/test";

/**
 * Epic 4: Portfolio Management
 * Beads ID: a2ui-m0c
 *
 * Tasks covered:
 * - 4.1 Demo portfolio data (a2ui-15p)
 * - 4.2 Portfolio data model (a2ui-hh6)
 * - 4.3 Real-time value calculation (a2ui-9s5)
 * - 4.4 Chat portfolio commands (a2ui-ws8)
 * - 4.6 ESG score aggregation (a2ui-b8m)
 * - 4.8 Benchmark comparison (a2ui-eeg)
 */

test.describe("Epic 4: Portfolio Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Task 4.1: Demo portfolio data
  // Acceptance: Portfolio loads with pre-populated holdings
  test("demo portfolio is pre-populated on first visit", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    // Wait for portfolio to load
    await page.waitForSelector("[data-testid='portfolio-content'], [data-testid='holdings-list']", {
      timeout: 10000,
    });

    // Should have multiple holdings
    const holdings = page.locator("[data-testid='holding-row'], [data-testid='holding'], tr[data-symbol]");
    const count = await holdings.count();
    expect(count).toBeGreaterThanOrEqual(5); // Demo has 11 stocks

    // Should include known demo stocks (at least one)
    const portfolioContent = page.locator("[data-testid='portfolio-content'], [data-tab='portfolio']");
    const text = await portfolioContent.textContent();
    const demoStocks = ["AAPL", "MSFT", "NESN", "ASML", "TSM", "Vestas", "Apple", "Microsoft"];
    const hasKnownStock = demoStocks.some((stock) => text?.includes(stock));
    expect(hasKnownStock).toBeTruthy();
  });

  // Task 4.2: Portfolio data model
  // Acceptance: Holdings show symbol, shares, weight
  test("holdings display complete data", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='holding-row'], [data-testid='holding']", {
      timeout: 10000,
    });

    const firstHolding = page.locator("[data-testid='holding-row'], [data-testid='holding']").first();

    // Should show symbol
    await expect(firstHolding).toContainText(/[A-Z]{2,5}/);

    // Should show some numeric value (shares, weight, or price)
    const text = await firstHolding.textContent();
    expect(text).toMatch(/\d+/);
  });

  // Task 4.3: Real-time value calculation
  // Acceptance: Portfolio total value is displayed
  test("portfolio total value is calculated and displayed", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='portfolio-value'], [data-testid='total-value']", {
      timeout: 10000,
    });

    const totalValue = page.locator("[data-testid='portfolio-value'], [data-testid='total-value']");
    const valueText = await totalValue.textContent();

    // Should show currency and amount
    expect(valueText).toMatch(/CHF|USD|EUR|\$|€/);
    expect(valueText).toMatch(/[\d,.']+/);
  });

  test("portfolio shows daily change percentage", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='portfolio-change'], [data-testid='daily-change']", {
      timeout: 10000,
    });

    const change = page.locator("[data-testid='portfolio-change'], [data-testid='daily-change']");
    const changeText = await change.textContent();

    // Should show percentage with +/- or color indicator
    expect(changeText).toMatch(/%|↑|↓|\+|-/);
  });

  // Task 4.4: Chat portfolio commands
  // Acceptance: Can add/remove holdings via chat
  test("can add holding via chat command", async ({ page }) => {
    // Go to chat
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // Add a stock
    await chatInput.fill("Add 5 shares of GOOGL to my portfolio");
    await sendButton.click();

    // Wait for confirmation
    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const responseText = await response.textContent();

    // Should confirm addition
    expect(responseText?.toLowerCase()).toMatch(/added|google|googl|portfolio|success/i);

    // Verify in portfolio tab
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();
    await page.waitForSelector("[data-testid='portfolio-content']", { timeout: 5000 });

    const portfolio = page.locator("[data-testid='portfolio-content'], [data-tab='portfolio']");
    await expect(portfolio).toContainText(/GOOGL|Google|Alphabet/i);
  });

  test("can remove holding via chat command", async ({ page }) => {
    // Go to chat
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // Remove a stock (AAPL is in demo portfolio)
    await chatInput.fill("Remove all AAPL shares from my portfolio");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const responseText = await response.textContent();

    // Should confirm removal
    expect(responseText?.toLowerCase()).toMatch(/removed|sold|apple|aapl|portfolio/i);
  });

  // Task 4.6: ESG score aggregation
  // Acceptance: Portfolio shows aggregate ESG score
  test("portfolio displays aggregate ESG score", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='portfolio-esg'], [data-testid='esg-score']", {
      timeout: 10000,
    });

    const esgScore = page.locator("[data-testid='portfolio-esg'], [data-testid='esg-score']");
    const scoreText = await esgScore.textContent();

    // Should show numeric score (0-100)
    expect(scoreText).toMatch(/\d+/);
    const numericScore = parseInt(scoreText?.match(/\d+/)?.[0] || "0");
    expect(numericScore).toBeGreaterThanOrEqual(0);
    expect(numericScore).toBeLessThanOrEqual(100);
  });

  test("ESG breakdown shows E, S, G components", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='esg-breakdown'], [data-testid='esg-details']", {
      timeout: 10000,
    });

    const breakdown = page.locator("[data-testid='esg-breakdown'], [data-testid='esg-details']");
    const text = await breakdown.textContent();

    // Should show Environmental, Social, Governance
    expect(text?.toLowerCase()).toMatch(/environmental|social|governance|^e$|^s$|^g$/i);
  });

  // Task 4.8: Benchmark comparison
  // Acceptance: Portfolio vs benchmark is displayed
  test("portfolio shows benchmark comparison", async ({ page }) => {
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    await page.waitForSelector("[data-testid='benchmark'], [data-testid='vs-benchmark']", {
      timeout: 10000,
    });

    const benchmark = page.locator("[data-testid='benchmark'], [data-testid='vs-benchmark']");
    const text = await benchmark.textContent();

    // Should mention benchmark (MSCI ESG or similar)
    expect(text?.toLowerCase()).toMatch(/msci|benchmark|index|vs|compared/i);

    // Should show relative performance (+/-%)
    expect(text).toMatch(/%|outperform|underperform|\+|-/i);
  });
});
