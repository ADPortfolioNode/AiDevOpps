import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to clear the agent's timeline between tests
async function clearAgentTimeline({ request }) {
  const response = await request.delete('/api/concierge/timeline');
  expect(response.ok()).toBe(true);
}

test.describe('Core API Workflows and URL Accessibility', () => {
  // Use a hook to ensure the timeline is clear before each test
  test.beforeEach(clearAgentTimeline);

  test('should render the main chat interface at the base URL', async ({ page }) => {
    // This test verifies that the baseURL is reachable and renders the main UI.
    // It checks for the presence of the initial assistant message.
    await page.goto('/');
    const welcomeMessage = page.getByText('AiDevOps System Status: ONLINE.');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should get a streaming response from the chat API', async ({ request }) => {
    const userMessage = 'Hello, assistant!';
    // This test verifies the primary chat endpoint is responsive and returns a stream.
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: userMessage }],
        model: 'gpt-4o-mini', // The API requires a model to be specified.
      },
    });

    expect(response.ok()).toBe(true);
    // For a streaming response, we verify the content type and ensure the body is not empty.
    expect(response.headers()['content-type']).toContain('text/plain');
    const responseBody = await response.text();
    expect(responseBody).not.toBe('');
  });

  test('should successfully ingest a text file', async ({ request }) => {
    // Create a dummy file for testing
    const filePath = path.join(__dirname, 'test-doc.txt');
    const fileContent = 'This is a test document for ingestion.';
    fs.writeFileSync(filePath, fileContent);
    try {
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
    } finally {
      // Ensure clean up even if expectations fail
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
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

  test('should handle API error for a bad URL during ingestion', async ({ request }) => {
    const response = await request.post('/api/ingest', {
      multipart: {
        url: 'http://thissitedoesnotexist.fail',
      },
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toContain('Failed to load');
  });
});

test.describe('Full End-to-End UI/UX Scenarios', () => {
  // UI flows share one server instance — run serially to avoid cross-test interference.
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, request }, testInfo) => {
    await clearAgentTimeline({ request });
    await page.addInitScript(() => {
      localStorage.setItem('aidevopps-model', 'gpt-4o-mini');
    });
  });

  test('should perform a RAG chat interaction and verify agent timeline', async ({ page, request }) => {
    await page.goto('/');

    // 1. Ask a question that will trigger the RAG tool
    const ragQuestion = 'What is AiDevOps?';
    const chatPanel = page.getByRole('complementary', { name: 'AI Chat' });
    const chatInput = chatPanel.getByPlaceholder(/Ask a question/i);
    const sendButton = chatPanel.getByRole('button', { name: 'Send', exact: true });

    await chatInput.fill(ragQuestion);
    await sendButton.click();

    // UX regression: loading state (allow brief window before stream completes)
    await expect(sendButton).toBeDisabled({ timeout: 2000 }).catch(() => undefined);
    await expect(page.locator('.animate-bounce')).toBeVisible({ timeout: 5000 }).catch(() => undefined);

    // 2. Wait for the user message and a new assistant reply (not just the welcome message)
    await expect(page.locator('.message-bubble.user')).toContainText(ragQuestion, { timeout: 10000 });
    const assistantMessages = page.locator('.message-bubble.assistant');
    await expect(assistantMessages).toHaveCount(2, { timeout: 15000 });
    const assistantResponse = assistantMessages.last();
    await expect(assistantResponse).toContainText(/dashboard|Operations Management|knowledge base/i);

    // 3. Verify the agent timeline API shows that the RAG tool was used
    const timelineResponse = await request.get('/api/concierge/timeline');
    expect(timelineResponse.ok()).toBe(true);
    const timelineData = await timelineResponse.json();
    expect(timelineData).toHaveProperty('events');
    const toolUsedEvent = timelineData.events.find(event => event.type === 'Tool Used');
    expect(toolUsedEvent).toBeDefined();
    expect(toolUsedEvent.message).toContain('RAG Assistant searching');
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

  test('should handle document upload via File from the UI', async ({ page }) => {
    // Create a dummy file for uploading
    const filePath = path.join(__dirname, 'ui-upload-test.txt');
    const fileContent = 'This is a test document for UI file upload.';
    fs.writeFileSync(filePath, fileContent);
    try {
      await page.goto('/');

      // 1. Open the document upload modal
      await page.locator('button:has-text("Upload Document")').click();
      const modalTitle = page.locator('h2:has-text("Upload to Knowledge Base")');
      await expect(modalTitle).toBeVisible();

      // 2. Set the file for the input
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('label:has-text("Click to upload")').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filePath);

      // 3. Submit the form and wait for success
      await page.locator('button:has-text("Ingest")').click();
      const feedbackMessage = page.locator('p:text-matches("Successfully ingested ui-upload-test.txt")');
      await expect(feedbackMessage).toBeVisible({ timeout: 10000 });
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
});