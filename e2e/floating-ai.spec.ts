import { expect, test } from "@playwright/test";

/**
 * Floating AI Panel E2E Tests
 * Tests for the AI assistant panel and floating button
 */

test.describe("Floating AI Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Floating Button", () => {
    test("floating AI button is visible", async ({ page }) => {
      const button = page.getByTestId("floating-ai-button");
      await expect(button).toBeVisible();
    });

    test("button has correct aria label", async ({ page }) => {
      const button = page.getByTestId("floating-ai-button");
      await expect(button).toHaveAttribute("aria-label", "Open AI assistant");
    });

    test("button is positioned in bottom-right corner", async ({ page }) => {
      const button = page.getByTestId("floating-ai-button");
      const box = await button.boundingBox();

      expect(box).not.toBeNull();
      if (box) {
        const viewport = page.viewportSize();
        if (viewport) {
          // Should be near bottom-right
          expect(box.x + box.width).toBeGreaterThan(viewport.width - 100);
          expect(box.y + box.height).toBeGreaterThan(viewport.height - 100);
        }
      }
    });

    test("button is visible on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const button = page.getByTestId("floating-ai-button");
      await expect(button).toBeVisible();
    });
  });

  test.describe("Panel Opening", () => {
    test("clicking button opens AI panel", async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();

      const panel = page.getByTestId("ai-panel");
      await expect(panel).toBeVisible();
    });

    test("panel has backdrop overlay", async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();

      const backdrop = page.getByTestId("ai-panel-backdrop");
      await expect(backdrop).toBeVisible();
    });

    test("panel contains chat content", async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();

      const chatContent = page.getByTestId("chat-content");
      await expect(chatContent).toBeVisible();
    });

    test("panel has close button", async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();

      const closeButton = page.getByTestId("ai-panel-close");
      await expect(closeButton).toBeVisible();
    });

    test("panel is full width on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.getByTestId("floating-ai-button").click();

      const panel = page.getByTestId("ai-panel");
      const box = await panel.boundingBox();

      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBe(375);
      }
    });
  });

  test.describe("Panel Closing", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();
      await page.getByTestId("ai-panel").waitFor({ state: "visible" });
    });

    test("close button closes panel", async ({ page }) => {
      await page.getByTestId("ai-panel-close").click();

      const panel = page.getByTestId("ai-panel");
      await expect(panel).not.toBeInViewport();
    });

    test("Escape key closes panel", async ({ page }) => {
      await page.keyboard.press("Escape");

      const panel = page.getByTestId("ai-panel");
      await expect(panel).not.toBeInViewport();
    });

    test("clicking backdrop closes panel", async ({ page }) => {
      await page.getByTestId("ai-panel-backdrop").click();

      const panel = page.getByTestId("ai-panel");
      await expect(panel).not.toBeInViewport();
    });
  });

  test.describe("Chat Interaction", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();
      await page.getByTestId("ai-panel").waitFor({ state: "visible" });
    });

    test("chat input is visible", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await expect(chatInput).toBeVisible();
    });

    test("send button is visible", async ({ page }) => {
      const sendButton = page.getByTestId("send-button");
      await expect(sendButton).toBeVisible();
    });

    test("can type in chat input", async ({ page }) => {
      const chatInput = page.getByTestId("chat-input");
      await chatInput.fill("Hello, AI assistant!");
      await expect(chatInput).toHaveValue("Hello, AI assistant!");
    });
  });

  test.describe("Accessibility", () => {
    test("panel has proper ARIA attributes", async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();

      const panel = page.getByTestId("ai-panel");
      await expect(panel).toHaveAttribute("role", "dialog");
      await expect(panel).toHaveAttribute("aria-modal", "true");
      await expect(panel).toHaveAttribute("aria-label", "AI Assistant");
    });

    test("close button has aria-label", async ({ page }) => {
      await page.getByTestId("floating-ai-button").click();

      const closeButton = page.getByTestId("ai-panel-close");
      await expect(closeButton).toHaveAttribute(
        "aria-label",
        "Close AI assistant",
      );
    });

    test("button aria-expanded changes with state", async ({ page }) => {
      const button = page.getByTestId("floating-ai-button");

      // Initially not expanded
      await expect(button).toHaveAttribute("aria-expanded", "false");

      // Click to open
      await button.click();
      await page.getByTestId("ai-panel").waitFor({ state: "visible" });

      // Should now be expanded
      await expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  test.describe("Panel Animation", () => {
    test("panel slides in from right", async ({ page }) => {
      // Check initial position (off-screen)
      const panel = page.getByTestId("ai-panel");

      // Open panel
      await page.getByTestId("floating-ai-button").click();

      // Panel should become visible and animate in
      await expect(panel).toBeVisible();

      // Wait for animation
      await page.waitForTimeout(400);

      const box = await panel.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // Should be fully visible (not translated off-screen)
        const viewport = page.viewportSize();
        if (viewport) {
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
        }
      }
    });
  });
});
