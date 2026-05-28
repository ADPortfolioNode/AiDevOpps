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
});