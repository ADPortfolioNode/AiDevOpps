import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to the home page', async ({ page }) => {
    // Start from the index page (the baseURL is set in the config)
    await page.goto('/');

    // The page should have the correct title
    await expect(page).toHaveTitle(/Create Next App/);

    // Find a link with the text "Get Started" and check if it's visible
    const getStartedLink = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedLink).toBeVisible();
  });
});