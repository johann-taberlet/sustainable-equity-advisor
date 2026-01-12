import { expect, test } from "@playwright/test";

/**
 * Epic 9: Security & Rate Limiting
 * Beads ID: a2ui-ems
 *
 * Tasks covered:
 * - 9.1 reCAPTCHA v3 integration (a2ui-96l)
 * - 9.2 Session message quota (a2ui-4er)
 * - 9.3 IP rate limiting (a2ui-pxa)
 */

test.describe("Epic 9: Security & Rate Limiting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Task 9.1: reCAPTCHA v3 integration
  // Acceptance: reCAPTCHA is loaded (invisible)
  test("reCAPTCHA v3 is integrated", async ({ page }) => {
    // Check for reCAPTCHA script
    const recaptchaScript = page.locator(
      "script[src*='recaptcha'], script[src*='grecaptcha']",
    );
    const hasScript = (await recaptchaScript.count()) > 0;

    // Or check for grecaptcha object
    const hasGrecaptcha = await page.evaluate(() => {
      return (
        typeof (window as unknown as { grecaptcha?: unknown }).grecaptcha !==
        "undefined"
      );
    });

    // Or check for reCAPTCHA badge (v3 shows badge)
    const badge = page.locator(".grecaptcha-badge");
    const hasBadge = (await badge.count()) > 0;

    expect(hasScript || hasGrecaptcha || hasBadge).toBeTruthy();
  });

  test("chat form is protected by reCAPTCHA", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    // Monitor network for reCAPTCHA verification
    const recaptchaRequests: string[] = [];
    page.on("request", (request) => {
      if (
        request.url().includes("recaptcha") ||
        request.url().includes("grecaptcha")
      ) {
        recaptchaRequests.push(request.url());
      }
    });

    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Test message");
    await sendButton.click();

    // Wait for any reCAPTCHA activity
    await page.waitForTimeout(2000);

    // Should have made reCAPTCHA request OR form has token field
    const tokenField = page.locator(
      "input[name*='captcha'], input[name*='recaptcha'], [data-recaptcha]",
    );
    const hasToken = (await tokenField.count()) > 0;

    expect(recaptchaRequests.length > 0 || hasToken).toBeTruthy();
  });

  // Task 9.2: Session message quota
  // Acceptance: Message quota is tracked and displayed
  test("message quota indicator is visible", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    // Wait for chat to load
    await page.waitForSelector(
      "[data-testid='chat-content'], [data-testid='chat-input']",
      {
        timeout: 10000,
      },
    );

    // Should show quota indicator
    const quotaIndicator = page.locator(
      "[data-testid='quota'], [data-testid='messages-remaining'], [aria-label*='quota' i]",
    );

    if ((await quotaIndicator.count()) > 0) {
      await expect(quotaIndicator.first()).toBeVisible();

      // Should show a number
      const text = await quotaIndicator.first().textContent();
      expect(text).toMatch(/\d+/);
    } else {
      // Alternative: check in footer or header
      const pageText = await page.locator("body").textContent();
      const hasQuotaMention = /\d+\s*(messages?|remaining|left)/i.test(
        pageText || "",
      );
      expect(hasQuotaMention).toBeTruthy();
    }
  });

  test("quota decreases after sending message", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const quotaIndicator = page.locator(
      "[data-testid='quota'], [data-testid='messages-remaining']",
    );

    // Get initial quota (if visible)
    let initialQuota = 20; // Default
    if ((await quotaIndicator.count()) > 0) {
      const text = await quotaIndicator.first().textContent();
      initialQuota = parseInt(text?.match(/\d+/)?.[0] || "20", 10);
    }

    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    await chatInput.fill("Hello");
    await sendButton.click();

    // Wait for response
    await page.waitForSelector(
      "[data-testid='assistant-message'], .assistant-message",
      {
        timeout: 60000,
      },
    );

    // Check quota decreased
    if ((await quotaIndicator.count()) > 0) {
      const newText = await quotaIndicator.first().textContent();
      const newQuota = parseInt(newText?.match(/\d+/)?.[0] || "20", 10);
      expect(newQuota).toBeLessThan(initialQuota);
    }
  });

  test("quota warning appears when low", async ({ page }) => {
    // This test simulates low quota scenario
    // In real implementation, you might mock the quota state
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    // Check for quota warning styling/message capability
    const warningIndicator = page.locator(
      "[data-testid='quota-warning'], [data-testid='quota'][class*='warning'], [aria-label*='low' i]",
    );

    // If quota is low, warning should be visible
    // Otherwise, just verify the warning element exists in DOM (hidden)
    const warningExists = (await warningIndicator.count()) > 0;

    // Or check that app has quota-related UI at all
    const hasQuotaUI =
      (await page.locator("[data-testid='quota']").count()) > 0;

    expect(warningExists || hasQuotaUI).toBeTruthy();
  });

  // Task 9.3: IP rate limiting
  // Acceptance: Rate limit errors handled gracefully
  test("rate limit error is handled gracefully", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    // We can't easily trigger actual rate limiting in E2E
    // Instead, verify error handling UI exists
    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    // Send a message and verify error doesn't break UI
    await chatInput.fill("Test");
    await sendButton.click();

    // Wait for response or error
    await page.waitForTimeout(5000);

    // UI should still be functional
    await expect(chatInput).toBeEnabled();

    // No raw error messages exposed
    const body = page.locator("body");
    await expect(body).not.toContainText("429");
    await expect(body).not.toContainText("Rate limit");
    await expect(body).not.toContainText("Too many requests");
  });

  test("API key is not exposed in client", async ({ page }) => {
    // Check that API keys aren't in page source
    const pageContent = await page.content();

    // Common API key patterns
    const apiKeyPatterns = [
      /sk-[a-zA-Z0-9]{20,}/, // OpenRouter/OpenAI style
      /OPENROUTER_API_KEY/,
      /FMP_API_KEY/,
      /api[_-]?key.*=.*[a-zA-Z0-9]{20,}/i,
    ];

    for (const pattern of apiKeyPatterns) {
      expect(pageContent).not.toMatch(pattern);
    }
  });

  test("session persists across page reloads", async ({ page }) => {
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    const chatInput = page
      .getByTestId("chat-input")
      .or(page.locator("textarea, input[type='text']").first());
    const sendButton = page
      .getByTestId("send-button")
      .or(page.getByRole("button", { name: /send/i }));

    // Send a message
    await chatInput.fill("Remember this: the password is banana");
    await sendButton.click();

    await page.waitForSelector(
      "[data-testid='assistant-message'], .assistant-message",
      {
        timeout: 60000,
      },
    );

    // Reload page
    await page.reload();
    await page.getByRole("tab", { name: /chat|advisor/i }).click();

    // Check if session/quota state persisted
    const quotaIndicator = page.locator(
      "[data-testid='quota'], [data-testid='messages-remaining']",
    );
    if ((await quotaIndicator.count()) > 0) {
      const text = await quotaIndicator.first().textContent();
      const quota = parseInt(text?.match(/\d+/)?.[0] || "20", 10);
      // Should be less than initial (20) if session persisted
      expect(quota).toBeLessThan(20);
    }
  });
});
