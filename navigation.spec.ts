import { test, expect } from '@playwright/test';

test.describe('App Navigation', () => {
  test('should navigate between pages using the sidebar', async ({ page }) => {
    await page.goto('/');

    // 1. Check initial page (Dashboard)
    await expect(page.getByRole('heading', { name: 'AiDevOpps is ready to help.' })).toBeVisible();

    // 2. Navigate to Workflows
    await page.getByRole('link', { name: 'Workflows' }).click();
    await expect(page).toHaveURL('/workflows');
    const firstWorkflow = page.getByText('Daily Standup Summary').first();
    await expect(firstWorkflow).toBeVisible();
    // Verify status toggle functionality
    const pauseButton = page.getByRole('button', { name: 'Pause' }).first();
    await pauseButton.click();
    await expect(page.getByRole('button', { name: 'Resume' }).first()).toBeVisible();

    // Navigate to Analytics
    await page.getByRole('link', { name: 'Analytics' }).click();
    await expect(page).toHaveURL('/analytics');
    await expect(page.getByText('Total Agent Tasks')).toBeVisible();
    await expect(page.getByText('RAG Hit Rate')).toBeVisible();

    // 3. Navigate to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByText('AI Provider Keys')).toBeVisible();
    await expect(page.getByText('OpenAI API Key')).toBeVisible();
    // Verify the toggle switch exists
    await expect(page.getByText('Verbose Observability Tracing')).toBeVisible();
    await expect(page.locator('.h-6.w-11.rounded-full')).toBeVisible();

    // 3a. Navigate to User Profile sub-page
    await page.getByRole('link', { name: 'User Profile' }).click();
    await expect(page).toHaveURL('/settings/profile');
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();

    // 4. Navigate back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'AiDevOpps is ready to help.' })).toBeVisible();
  });

  test('should toggle the observability tracing setting', async ({ page }) => {
    await page.goto('/settings');

    // Find the toggle switch container
    const toggleContainer = page.locator('.h-6.w-11.rounded-full');
    await expect(toggleContainer).toBeVisible();

    // The inner circle should be on the right initially (indicating "on")
    await expect(toggleContainer.locator('div')).toHaveClass(/right-1/);

    // Click the toggle and verify the state changes
    await toggleContainer.click();
    await expect(toggleContainer.locator('div')).not.toHaveClass(/right-1/);
  });

  test('should allow updating user profile', async ({ page }) => {
    await page.goto('/settings/profile');

    const nameInput = page.getByLabel('Full Name');
    await expect(nameInput).toHaveValue('Deo');

    // Change the name
    await nameInput.fill('Deo Ism');
    await expect(nameInput).toHaveValue('Deo Ism');

    // Click save and verify state changes
    const saveButton = page.getByRole('button', { name: 'Save Changes' });
    await saveButton.click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeVisible();
    await expect(page.getByText('Changes saved successfully!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });
});