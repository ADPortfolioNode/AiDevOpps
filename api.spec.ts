import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Core API Workflows and URL Accessibility', () => {
  test('should render the main chat interface at the base URL', async ({ page }) => {
    // This test verifies that the baseURL is reachable and renders the main UI.
    // It checks for the presence of the initial assistant message.
    await page.goto('/');
    const welcomeMessage = page.locator('text/AiDevOps System Status: ONLINE.');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should get a response from the chat API', async ({ request }) => {
    const userMessage = 'Hello, assistant!';
    // This test verifies the primary chat endpoint is responsive.
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: userMessage }],
      },
    });

    expect(response.ok()).toBe(true);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('content');
    expect(typeof responseBody.content).toBe('string');
  });

  test('should successfully ingest a text file', async ({ request }) => {
    // Create a dummy file for testing
    const filePath = path.join(__dirname, 'test-doc.txt');
    const fileContent = 'This is a test document for ingestion.';
    fs.writeFileSync(filePath, fileContent);

    const fileBuffer = fs.readFileSync(filePath);

    const response = await request.post('/api/ingest', {
      multipart: {
        document: {
          name: 'test-doc.txt',
          mimeType: 'text/plain',
          buffer: fileBuffer,
        },
      },
    });

    expect(response.ok()).toBe(true);
    const responseBody = await response.json();
    expect(responseBody.message).toContain('Successfully ingested');

    // Clean up the dummy file
    fs.unlinkSync(filePath);
  });

  test('should successfully ingest a URL', async ({ request }) => {
    // Using a known, reliable, and simple page for testing.
    const testUrl = 'https://info.cern.ch/hypertext/WWW/TheProject.html';

    const response = await request.post('/api/ingest', {
      multipart: {
        url: testUrl,
      },
    });

    expect(response.ok()).toBe(true);
    const responseBody = await response.json();
    expect(responseBody.message).toContain('Successfully ingested');
  });

  test('should perform a full chat interaction via the UI', async ({ page }) => {
    await page.goto('/');

    // 1. Find a quick action prompt and click it
    const quickActionPromptText = 'What are the next steps for the "Website Redesign" project?';
    const quickActionPrompt = page.locator(`text=${quickActionPromptText}`);
    await quickActionPrompt.click();

    // 2. Verify the chat input is populated
    const chatInput = page.locator('textarea[placeholder*="Ask a question"]');
    await expect(chatInput).toHaveValue(quickActionPromptText);

    // 3. Submit the form
    await page.locator('button[type="submit"]').click();

    // 4. Wait for and verify the assistant's response
    const assistantResponse = page.locator('.message-bubble.assistant').last();
    await expect(assistantResponse).toBeVisible({ timeout: 15000 }); // Wait up to 15s for the agent
    await expect(assistantResponse).not.toBeEmpty();
  });

  test('should handle document upload via URL from the UI', async ({ page }) => {
    await page.goto('/');

    // 1. Open the document upload modal
    await page.locator('button:has-text("Upload Document")').click();
    const modalTitle = page.locator('h2:has-text("Upload to Knowledge Base")');
    await expect(modalTitle).toBeVisible();

    // 2. Switch to the URL tab and fill in the input
    await page.locator('button:has-text("From URL")').click();
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://info.cern.ch/hypertext/WWW/TheProject.html');

    // 3. Submit the form and wait for the success feedback
    await page.locator('button:has-text("Ingest")').click();
    const feedbackMessage = page.locator('p:text-matches("Successfully ingested URL")');
    await expect(feedbackMessage).toBeVisible({ timeout: 10000 });

    // 4. Verify the modal closes automatically after success
    await expect(modalTitle).not.toBeVisible({ timeout: 5000 });
  });
});