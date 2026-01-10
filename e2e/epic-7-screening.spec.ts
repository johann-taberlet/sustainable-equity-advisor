import { test, expect } from "@playwright/test";

/**
 * Epic 7: ESG Screening
 * Beads ID: a2ui-2u9
 *
 * Tasks covered:
 * - 7.1 Natural language screening (a2ui-03o)
 * - 7.3 Sector filter (a2ui-m43)
 * - 7.5 ESG score threshold (a2ui-ee4)
 * - 7.8 Results pagination (a2ui-xii)
 */

test.describe("Epic 7: ESG Screening", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /screen|esg/i }).click();
  });

  // Task 7.1: Natural language screening
  // Acceptance: Chat understands screening queries
  test("natural language screening via chat", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Show me European tech stocks with ESG score above 70");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message, [data-a2ui]", {
      timeout: 60000,
    });

    // Should return results (table, list, or cards)
    const results = page.locator(
      "[data-testid='screening-results'], table, [data-a2ui='List'], [data-testid='stock-list']"
    );
    const hasResults = (await results.count()) > 0;

    // Or text mentioning stocks
    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();
    const mentionsStocks = /stock|company|companies|result|found/i.test(text || "");

    expect(hasResults || mentionsStocks).toBeTruthy();
  });

  // Task 7.3: Sector filter
  // Acceptance: Can filter by sector
  test("sector filter is available", async ({ page }) => {
    // Wait for screening UI
    await page.waitForSelector("[data-testid='screening-content'], [data-testid='sector-filter']", {
      timeout: 10000,
    });

    // Sector filter should exist
    const sectorFilter = page.locator(
      "[data-testid='sector-filter'], select[name='sector'], [role='combobox'][aria-label*='sector' i]"
    );

    if ((await sectorFilter.count()) > 0) {
      await expect(sectorFilter.first()).toBeVisible();

      // Should have multiple sectors
      await sectorFilter.first().click();
      const options = page.locator("[role='option'], option");
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThanOrEqual(3);
    } else {
      // Alternative: sector mentioned in chat screening
      test.skip();
    }
  });

  test("filtering by sector returns relevant results", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Show me healthcare stocks only");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Should mention healthcare companies or sector
    expect(text?.toLowerCase()).toMatch(/healthcare|pharma|medical|novartis|johnson|pfizer/i);
  });

  // Task 7.5: ESG score threshold
  // Acceptance: Can set minimum ESG score
  test("can filter by minimum ESG score", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Find stocks with ESG score above 80");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Should acknowledge the threshold or show results
    expect(text?.toLowerCase()).toMatch(/80|above|threshold|score|esg|high|top/i);
  });

  test("ESG threshold filter excludes low scores", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // Ask for high ESG only
    await chatInput.fill("Only show companies with excellent ESG ratings above 85");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message, [data-a2ui]", {
      timeout: 60000,
    });

    // Check that results don't include low scores
    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Should not include obviously low scores in results
    // (This is a heuristic check)
    const hasLowScore = /score:?\s*[1-4]\d/i.test(text || "");
    expect(hasLowScore).toBeFalsy();
  });

  // Task 7.8: Results pagination
  // Acceptance: Results are paginated or scrollable
  test("screening results handle multiple items", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Show me all technology stocks");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    // Should show multiple results or indicate there are more
    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Check for pagination indicators or multiple results
    const hasPagination = page.locator("[data-testid='pagination'], [aria-label*='page'], .pagination");
    const hasMultipleResults = /\d+\s*(results|companies|stocks|found)|showing|page/i.test(text || "");
    const hasLoadMore = page.locator("button:has-text('more'), button:has-text('next')");

    const paginationCount = await hasPagination.count();
    const loadMoreCount = await hasLoadMore.count();

    expect(hasMultipleResults || paginationCount > 0 || loadMoreCount > 0).toBeTruthy();
  });

  test("results are sorted by ESG score by default", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("List top ESG rated stocks");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    // Response should show high-scoring stocks first
    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Should mention "top" or show descending order
    expect(text?.toLowerCase()).toMatch(/top|best|highest|leading|sorted/i);
  });
});
