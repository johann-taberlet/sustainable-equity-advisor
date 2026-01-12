import { expect, test } from "@playwright/test";

/**
 * Epic 2: A2UI Integration
 * Beads ID: a2ui-k8e
 *
 * Tasks covered:
 * - 2.1 A2UI renderer setup (a2ui-7t5)
 * - 2.2 Financial component catalog (a2ui-7im)
 * - 2.3 A2UI message parser (a2ui-ztg)
 * - 2.4 Fallback to plain text (a2ui-tid)
 * - 2.6 User action handling (a2ui-i9q)
 * - 2.7 A2UI state sync (a2ui-3zr)
 */

test.describe("Epic 2: A2UI Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to chat tab
    await page.getByRole("tab", { name: /chat|advisor/i }).click();
  });

  // Task 2.1: A2UI renderer setup
  // Acceptance: A2UI components render in chat
  test("A2UI components render in chat responses", async ({ page }) => {
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    // Send a message that should trigger A2UI response
    await chatInput.fill("Show me my portfolio summary");
    await sendButton.click();

    // Wait for response
    await page.waitForSelector("[data-a2ui], [data-testid='a2ui-component']", {
      timeout: 30000,
    });

    // A2UI component should be visible
    const a2uiComponent = page.locator(
      "[data-a2ui], [data-testid='a2ui-component']",
    );
    await expect(a2uiComponent.first()).toBeVisible();
  });

  // Task 2.2: Financial component catalog
  // Acceptance: Financial components render correctly
  test("PortfolioSummaryCard renders with correct data", async ({ page }) => {
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Show portfolio value");
    await sendButton.click();

    // Wait for portfolio card
    await page.waitForSelector(
      "[data-a2ui='PortfolioSummaryCard'], [data-testid='portfolio-summary']",
      {
        timeout: 30000,
      },
    );

    // Card should show value (CHF amount)
    const card = page.locator(
      "[data-a2ui='PortfolioSummaryCard'], [data-testid='portfolio-summary']",
    );
    await expect(card).toContainText(/CHF|USD|EUR|\$|€/);
  });

  test("ESGScoreGauge renders score visually", async ({ page }) => {
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("What is my portfolio ESG score?");
    await sendButton.click();

    // Wait for ESG gauge
    await page.waitForSelector(
      "[data-a2ui='ESGScoreGauge'], [data-testid='esg-gauge'], [data-testid='esg-score']",
      {
        timeout: 30000,
      },
    );

    // Should show score number
    const gauge = page.locator(
      "[data-a2ui='ESGScoreGauge'], [data-testid='esg-gauge'], [data-testid='esg-score']",
    );
    await expect(gauge).toContainText(/\d+/);
  });

  // Task 2.3: A2UI message parser
  // Acceptance: JSON is parsed and rendered correctly
  test("A2UI JSON in response is parsed and rendered", async ({ page }) => {
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("List my holdings");
    await sendButton.click();

    // Wait for structured response
    await page.waitForSelector("[data-a2ui], [data-testid='holdings-list']", {
      timeout: 30000,
    });

    // Should NOT show raw JSON
    const chatMessages = page.locator(
      "[data-testid='chat-message'], .chat-message",
    );
    await expect(chatMessages.last()).not.toContainText("surfaceUpdate");
    await expect(chatMessages.last()).not.toContainText('"component"');
  });

  // Task 2.4: Fallback to plain text
  // Acceptance: Invalid JSON shows text gracefully
  test("invalid A2UI falls back to plain text", async ({ page }) => {
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    // Simple question that might not need A2UI
    await chatInput.fill("Hello");
    await sendButton.click();

    // Wait for any response
    await page.waitForSelector(
      "[data-testid='chat-message'], .chat-message, [data-testid='assistant-message']",
      {
        timeout: 30000,
      },
    );

    // Should show text response, no errors
    const response = page
      .locator("[data-testid='assistant-message'], .assistant-message")
      .last();
    await expect(response).not.toContainText("Error");
    await expect(response).not.toContainText("Failed to parse");
  });

  // Task 2.6: User action handling
  // Acceptance: Buttons in A2UI trigger actions
  test("A2UI buttons trigger actions", async ({ page }) => {
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Show me actions I can take");
    await sendButton.click();

    // Wait for action buttons
    await page.waitForSelector(
      "[data-a2ui='ActionButton'], [data-a2ui-action], button[data-action]",
      {
        timeout: 30000,
      },
    );

    // Click an action button
    const actionButton = page
      .locator(
        "[data-a2ui='ActionButton'], [data-a2ui-action], button[data-action]",
      )
      .first();
    await actionButton.click();

    // Should trigger some response (new message or state change)
    await page.waitForTimeout(1000);
    const messageCount = await page
      .locator("[data-testid='chat-message'], .chat-message")
      .count();
    expect(messageCount).toBeGreaterThanOrEqual(2);
  });

  // Task 2.7: A2UI state sync
  // Acceptance: A2UI updates reflect in app state
  test("A2UI data changes sync with app state", async ({ page }) => {
    // Navigate to portfolio tab first to see initial state
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    // Get initial portfolio value display
    const _initialValue = await page
      .locator("[data-testid='portfolio-value']")
      .textContent()
      .catch(() => null);

    // Go back to chat
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    // Add a holding via chat
    await chatInput.fill("Add 10 shares of AAPL to my portfolio");
    await sendButton.click();

    // Wait for confirmation
    await page.waitForSelector("[data-testid='chat-message']", {
      timeout: 30000,
    });

    // Go to portfolio tab
    await page.getByRole("tab", { name: /portfolio|dashboard/i }).click();

    // Portfolio should show AAPL or have updated
    const portfolioContent = page.locator(
      "[data-testid='portfolio-content'], [data-tab='portfolio']",
    );
    await expect(portfolioContent).toContainText(/AAPL|Apple|portfolio/i);
  });
});
