import { test, expect } from '@playwright/test';

test.describe('Agent Tool Usage via UI', () => {
  test('should invoke the weather tool and return a result', async ({ page }) => {
    await page.goto('/');

    const chatPanel = page.locator('aside[aria-label="AI Chat"]');
    const chatInput = chatPanel.getByPlaceholder('Ask a question or type a command...');

    // Ask a question that should trigger the weather tool
    await chatInput.fill('What is the weather like in San Francisco?');
    await page.keyboard.press('Enter');

    // Wait for the assistant's response and verify it contains expected content
    const assistantResponse = chatPanel.locator('.message-bubble.assistant').last();
    await expect(assistantResponse).toContainText('San Francisco', { timeout: 15000 });
    await expect(assistantResponse).toContainText('°F', { timeout: 15000 });
  });

  test('should invoke the web search tool for a timely question', async ({ page }) => {
    // This test requires a TAVILY_API_KEY to be set in the environment.
    test.skip(!process.env.TAVILY_API_KEY, 'TAVILY_API_KEY not set, skipping web search test.');

    await page.goto('/');

    const chatPanel = page.locator('aside[aria-label="AI Chat"]');
    const chatInput = chatPanel.getByPlaceholder('Ask a question or type a command...');

    // Ask a question that requires a web search
    await chatInput.fill('What is the latest news about Vercel?');
    await page.keyboard.press('Enter');

    const assistantResponse = chatPanel.locator('.message-bubble.assistant').last();
    await expect(assistantResponse).toContainText('Vercel', { timeout: 20000 });
  });
});