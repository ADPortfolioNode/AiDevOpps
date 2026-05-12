import { test, expect } from '@playwright/test';

test.describe('Hydration Checks', () => {
  test('should check for data-gptw attribute on body', async ({ page }) => {
    await page.goto('/');
    // Wait for hydration to complete (e.g., by waiting for a specific element to be visible)
    await page.waitForSelector('body'); // Or a more specific element that indicates hydration

    const bodyElement = page.locator('body');
    // If the attribute is expected to be present:
    await expect(bodyElement).toHaveAttribute('data-gptw', '');
    // If the attribute is expected to be absent on the client (e.g., removed by browser extension):
    // await expect(bodyElement).not.toHaveAttribute('data-gptw');
  });
});