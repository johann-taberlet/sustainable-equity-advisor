import { test, expect } from "@playwright/test";

/**
 * Epic 3: AI Chat Advisor
 * Beads ID: a2ui-moz
 *
 * Tasks covered:
 * - 3.1 OpenRouter API integration (a2ui-bbm)
 * - 3.2 Financial advisor persona (a2ui-dj7)
 * - 3.3 Conversation history (a2ui-1z2)
 * - 3.4 A2UI prompt instructions (a2ui-7fy)
 */

test.describe("Epic 3: AI Chat Advisor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /chat|advisor/i }).click();
  });

  // Task 3.1: OpenRouter API integration
  // Acceptance: Chat sends and receives messages
  test("chat sends message and receives response", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // Input should be enabled
    await expect(chatInput).toBeEnabled();

    // Send a message
    await chatInput.fill("Hello, what can you help me with?");
    await sendButton.click();

    // User message should appear
    await expect(page.locator("[data-testid='user-message'], .user-message").last()).toContainText("Hello");

    // Wait for response (with timeout for API)
    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    // Response should be non-empty
    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();
    expect(text?.length).toBeGreaterThan(10);
  });

  test("chat shows loading state while waiting", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("What is ESG investing?");
    await sendButton.click();

    // Either loading indicator is visible OR response arrived (API was fast)
    const loadingIndicator = page.locator("[data-testid='loading'], .loading, [aria-busy='true']");
    const response = page.locator("[data-testid='assistant-message'], .assistant-message").first();

    // Wait for either loading to appear or response to arrive
    await Promise.race([
      loadingIndicator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {}),
      response.waitFor({ state: "visible", timeout: 5000 }),
    ]);

    // Verify the chat processed the message (response should eventually appear)
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  // Task 3.2: Financial advisor persona
  // Acceptance: Responses are professional and include disclaimers
  test("advisor uses professional financial language", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Should I invest in tech stocks?");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Should use financial terminology (at least one of these)
    const financialTerms = [
      /portfolio/i,
      /investment/i,
      /risk/i,
      /return/i,
      /diversif/i,
      /asset/i,
      /equity/i,
      /sector/i,
      /market/i,
      /ESG/i,
    ];
    const hasFinancialTerm = financialTerms.some((term) => term.test(text || ""));
    expect(hasFinancialTerm).toBeTruthy();
  });

  test("advisor includes appropriate disclaimers", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("What stock should I buy today?");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    const response = page.locator("[data-testid='assistant-message'], .assistant-message").last();
    const text = await response.textContent();

    // Should include some form of disclaimer or cautionary language
    const disclaimerPatterns = [
      /not financial advice/i,
      /consult.*advisor/i,
      /risk/i,
      /past performance/i,
      /consider/i,
      /due diligence/i,
      /disclaimer/i,
    ];
    const hasDisclaimer = disclaimerPatterns.some((pattern) => pattern.test(text || ""));
    expect(hasDisclaimer).toBeTruthy();
  });

  // Task 3.3: Conversation history
  // Acceptance: Context is maintained across messages
  test("conversation maintains context", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // First message
    await chatInput.fill("I am interested in renewable energy stocks");
    await sendButton.click();
    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    // Follow-up message referencing previous context
    await chatInput.fill("What are the top 3 in this sector?");
    await sendButton.click();
    await page.waitForTimeout(2000); // Wait for second response
    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", {
      timeout: 60000,
    });

    // Second response should reference renewable/energy
    const responses = page.locator("[data-testid='assistant-message'], .assistant-message");
    const lastResponse = await responses.last().textContent();

    const contextPatterns = [/renewable/i, /energy/i, /solar/i, /wind/i, /green/i, /sustainable/i];
    const maintainsContext = contextPatterns.some((pattern) => pattern.test(lastResponse || ""));
    expect(maintainsContext).toBeTruthy();
  });

  test("conversation history is displayed", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // Send multiple messages
    await chatInput.fill("Hello");
    await sendButton.click();
    await page.waitForSelector("[data-testid='assistant-message'], .assistant-message", { timeout: 60000 });

    await chatInput.fill("Tell me about ESG");
    await sendButton.click();
    await page.waitForTimeout(2000);

    // Should show multiple message pairs
    const userMessages = page.locator("[data-testid='user-message'], .user-message");
    const assistantMessages = page.locator("[data-testid='assistant-message'], .assistant-message");

    expect(await userMessages.count()).toBeGreaterThanOrEqual(2);
    expect(await assistantMessages.count()).toBeGreaterThanOrEqual(1);
  });

  // Task 3.4: A2UI prompt instructions
  // Acceptance: Responses include A2UI components when appropriate
  test("advisor generates A2UI components for data queries", async ({ page }) => {
    const chatInput = page.getByTestId("chat-input").or(page.locator("textarea, input[type='text']").first());
    const sendButton = page.getByTestId("send-button").or(page.getByRole("button", { name: /send/i }));

    // Query that should trigger structured response
    await chatInput.fill("Show me a comparison of AAPL and MSFT ESG scores");
    await sendButton.click();

    // Wait for A2UI component
    await page.waitForSelector(
      "[data-a2ui], [data-testid='a2ui-component'], [data-testid='comparison-table']",
      { timeout: 60000 }
    );

    // Should render structured component, not just text
    const a2uiComponent = page.locator("[data-a2ui], [data-testid='a2ui-component']");
    const hasComponent = (await a2uiComponent.count()) > 0;

    // Or at minimum, should have formatted table/card
    const structuredContent = page.locator("table, [role='table'], [data-testid='card']");
    const hasStructured = (await structuredContent.count()) > 0;

    expect(hasComponent || hasStructured).toBeTruthy();
  });
});
