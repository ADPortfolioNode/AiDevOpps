import { test, expect } from '@playwright/test';

test.describe('Concierge Workflow', () => {
  test('should allow a full user workflow', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // 1. Verify main page content and initial chat state
    // Check for the "Welcome back" hero section
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    // The chat panel should be visible and contain a greeting
    const chatPanel = page.locator('aside[aria-label="AI Chat"]');
    await expect(chatPanel).toBeVisible();
    await expect(chatPanel.getByText(/Welcome to AiDevOpps/)).toBeVisible();

    // 2. Interact with a quick action
    // Find and click a prompt chip
    const promptChip = page.getByRole('button', { name: 'Create a 4-week goal to migrate our REST API to GraphQL.' });
    await expect(promptChip).toBeVisible();
    await promptChip.click();

    // 3. Verify chat interaction
    // The user's message (from the chip) should appear in the chat
    await expect(chatPanel.getByText('Create a 4-week goal to migrate our REST API to GraphQL.')).toBeVisible();

    // An assistant response should appear and eventually stop "thinking"
    await expect(chatPanel.locator('.message-bubble.assistant').last()).toBeVisible({ timeout: 10000 });
    await expect(chatPanel.getByText('Thinking...')).not.toBeVisible();

    // 4. Send a message via the input
    const chatInput = chatPanel.getByPlaceholder('Ask a question or type a command...');
    await expect(chatInput).toBeVisible();
    const userMessage = 'What is the weather in San Francisco?';
    await chatInput.fill(userMessage);
    await page.keyboard.press('Enter');

    // The new message and a new response should appear
    await expect(chatPanel.getByText(userMessage)).toBeVisible();
    await expect(chatPanel.locator('.message-bubble.assistant').last()).toBeVisible({ timeout: 10000 });
    await expect(chatPanel.getByText('Thinking...')).not.toBeVisible();
  });
});