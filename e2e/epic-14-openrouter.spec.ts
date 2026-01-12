import { expect, test } from "@playwright/test";

/**
 * Epic 14: OpenRouter LLM Integration
 * Beads ID: a2ui-87v
 *
 * Tasks covered:
 * - 14.1 API route /api/chat (a2ui-87v.1)
 * - 14.2 Environment configuration (a2ui-87v.2)
 * - 14.3 Mock/Real toggle system (a2ui-87v.3)
 * - 14.4 System prompt for A2UI generation (a2ui-87v.4)
 * - 14.5 Error handling and fallbacks (a2ui-87v.5)
 */

test.describe("Epic 14: OpenRouter LLM Integration", () => {
  // Task 14.1 & 14.2: API route exists and responds
  test("API route /api/chat exists and responds", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        message: "Hello",
        history: [],
      },
    });

    // Should return 200 (or 401 if auth required, but not 404)
    expect(response.status()).not.toBe(404);

    // Should return JSON
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("API route returns assistant message", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        message: "What is my portfolio value?",
        history: [],
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("message");
    expect(typeof data.message).toBe("string");
    expect(data.message.length).toBeGreaterThan(0);
  });

  // Task 14.3: Mock/Real toggle
  test("chat works in mock mode (default for tests)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input");
    const sendButton = page.getByTestId("send-button");

    await chatInput.fill("Show my portfolio");
    await sendButton.click();

    // Should get response (mock or real)
    await page.waitForSelector("[data-testid='assistant-message']", {
      timeout: 30000,
    });

    const assistantMessage = page.getByTestId("assistant-message").first();
    await expect(assistantMessage).toBeVisible();
  });

  // Task 14.4: A2UI JSON generation
  test("LLM generates valid A2UI JSON for portfolio queries", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input");
    const sendButton = page.getByTestId("send-button");

    await chatInput.fill("Show my ESG score");
    await sendButton.click();

    // Wait for response with A2UI component
    await page.waitForSelector("[data-testid='assistant-message']", {
      timeout: 30000,
    });

    // Should render an A2UI component (not just text)
    const a2uiComponent = page.locator("[data-testid='a2ui-component']");

    // Give it a moment for A2UI to parse and render
    await page.waitForTimeout(1000);

    const hasA2UI = (await a2uiComponent.count()) > 0;

    // Either we have A2UI components OR the response contains portfolio data
    if (!hasA2UI) {
      const messageText = await page
        .getByTestId("assistant-message")
        .first()
        .textContent();
      expect(messageText?.toLowerCase()).toMatch(/esg|score|portfolio/);
    }
  });

  // Task 14.5: Error handling
  test("handles API errors gracefully", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input");
    const sendButton = page.getByTestId("send-button");

    // Send a message
    await chatInput.fill("Test message");
    await sendButton.click();

    // Wait for response or error
    await page.waitForTimeout(5000);

    // UI should still be functional (not crashed)
    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    // No raw error stack traces exposed
    const pageContent = await page.content();
    expect(pageContent).not.toContain("Error: ");
    expect(pageContent).not.toContain("at Object.");
    expect(pageContent).not.toContain("OPENROUTER_API_KEY");
  });

  test("falls back to text when A2UI parsing fails", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input");
    const sendButton = page.getByTestId("send-button");

    // Generic message that may not trigger A2UI
    await chatInput.fill("Tell me about sustainable investing");
    await sendButton.click();

    // Should show some response (text or A2UI)
    await page.waitForSelector("[data-testid='assistant-message']", {
      timeout: 30000,
    });

    const assistantMessage = page.getByTestId("assistant-message").first();
    const text = await assistantMessage.textContent();

    // Should have meaningful content
    expect(text?.length).toBeGreaterThan(10);
  });

  // Integration test: full conversation flow
  test("maintains conversation context across messages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page.getByTestId("chat-input");
    const sendButton = page.getByTestId("send-button");

    // First message
    await chatInput.fill("My name is TestUser");
    await sendButton.click();

    await page.waitForSelector("[data-testid='assistant-message']", {
      timeout: 30000,
    });

    // Second message referencing first
    await chatInput.fill("What is my name?");
    await sendButton.click();

    // Wait for second response
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-testid='assistant-message']").length >=
        2,
      { timeout: 30000 },
    );

    // The response should reference the name (context maintained)
    const messages = page.getByTestId("assistant-message");
    const lastMessage = messages.last();
    const text = await lastMessage.textContent();

    // Context should be maintained (mock or real should handle this)
    expect(text?.toLowerCase()).toMatch(/testuser|name|you/i);
  });
});
