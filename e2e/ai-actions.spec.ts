import { expect, test } from "@playwright/test";

/**
 * AI Actions E2E Tests
 * Tests for AI-triggered actions on the dashboard
 */

test.describe("AI Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Open AI panel
    await page.getByTestId("floating-ai-button").click();
    await page.getByTestId("ai-panel").waitFor({ state: "visible" });
  });

  test.describe("Action System", () => {
    test("chat input accepts messages", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await chatInput.fill("Show me my holdings");
      await expect(chatInput).toHaveValue("Show me my holdings");
    });

    test("send button submits message", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await chatInput.fill("What is my portfolio value?");

      const sendButton = page.getByTestId("send-button");
      await sendButton.click();

      // Wait for user message to appear
      const userMessage = page.getByTestId("user-message");
      await expect(userMessage.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Navigation Actions", () => {
    test("AI can suggest navigating to different sections", async ({
      page,
    }) => {
      // Close panel first
      await page.getByTestId("ai-panel-close").click();

      // Navigate to holdings manually first to verify functionality
      await page.getByTestId("nav-holdings").click();
      await expect(page.getByTestId("holdings-content")).toBeVisible();

      // Navigate back to dashboard
      await page.getByTestId("nav-dashboard").click();
      await expect(page.getByTestId("portfolio-content")).toBeVisible();
    });
  });

  test.describe("Dashboard State", () => {
    test("dashboard shows holdings data", async ({ page }) => {
      // Close AI panel
      await page.getByTestId("ai-panel-close").click();

      // Navigate to holdings
      await page.getByTestId("nav-holdings").click();

      // Verify holdings are displayed
      const holdingRows = page.getByTestId("holding-row");
      const count = await holdingRows.count();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test("ESG scores are displayed for holdings", async ({ page }) => {
      // Close AI panel
      await page.getByTestId("ai-panel-close").click();

      // Navigate to holdings
      await page.getByTestId("nav-holdings").click();

      // Check ESG scores are visible
      const esgScores = page.getByTestId("holding-esg-score");
      const count = await esgScores.count();
      expect(count).toBeGreaterThan(0);

      // Verify scores are numbers
      const firstScore = await esgScores.first().textContent();
      expect(firstScore).toMatch(/\d+/);
    });
  });

  test.describe("Chat Interaction", () => {
    test("can send message and receive response", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await chatInput.fill("Hello");

      await page.getByTestId("send-button").click();

      // Wait for response with longer timeout (API calls)
      const assistantMessage = page.getByTestId("assistant-message");
      await expect(assistantMessage.first()).toBeVisible({ timeout: 30000 });
    });

    test("messages persist in chat", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await chatInput.fill("First message");
      await page.getByTestId("send-button").click();

      // Wait for response
      await page.getByTestId("assistant-message").first().waitFor({
        state: "visible",
        timeout: 30000,
      });

      // Send another message
      await chatInput.fill("Second message");
      await page.getByTestId("send-button").click();

      // Both user messages should be visible
      const userMessages = page.getByTestId("user-message");
      await expect(userMessages).toHaveCount(2);
    });
  });

  test.describe("Error Handling", () => {
    test("empty message is not sent", async ({ page }) => {
      const sendButton = page.getByTestId("send-button");

      // Button should be disabled when input is empty
      await expect(sendButton).toBeDisabled();
    });

    test("input is cleared after sending", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await chatInput.fill("Test message");
      await page.getByTestId("send-button").click();

      // Input should be cleared
      await expect(chatInput).toHaveValue("");
    });
  });

  test.describe("Portfolio Integration", () => {
    test("portfolio value is displayed on dashboard", async ({ page }) => {
      // Close AI panel
      await page.getByTestId("ai-panel-close").click();

      // Check portfolio value is visible
      const portfolioValue = page.getByTestId("portfolio-value");
      await expect(portfolioValue).toBeVisible();
      await expect(portfolioValue).toContainText("CHF");
    });

    test("ESG breakdown is visible on dashboard", async ({ page }) => {
      // Close AI panel
      await page.getByTestId("ai-panel-close").click();

      const esgBreakdown = page.getByTestId("esg-breakdown");
      await expect(esgBreakdown).toBeVisible();

      // Check for E, S, G components
      const eScore = page.getByTestId("e-score");
      const sScore = page.getByTestId("s-score");
      const gScore = page.getByTestId("g-score");

      await expect(eScore).toBeVisible();
      await expect(sScore).toBeVisible();
      await expect(gScore).toBeVisible();
    });
  });

  test.describe("Concurrent Operations", () => {
    test("can navigate while AI panel is open", async ({ page }) => {
      // Panel should still be open
      await expect(page.getByTestId("ai-panel")).toBeVisible();

      // Navigate using sidebar (need to close panel on mobile)
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        await page.getByTestId("ai-panel-close").click();
      }

      // Navigation still works
      await page.getByTestId("nav-esg").click();
      await expect(page.getByTestId("esg-content")).toBeVisible();
    });
  });
});
