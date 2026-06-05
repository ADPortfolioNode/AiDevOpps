# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Core API Workflows and URL Accessibility >> should successfully ingest a URL
- Location: api.spec.ts:71:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | import { fileURLToPath } from 'url';
  5   | 
  6   | const __filename = fileURLToPath(import.meta.url);
  7   | const __dirname = path.dirname(__filename);
  8   | 
  9   | // Helper function to clear the agent's timeline between tests
  10  | async function clearAgentTimeline({ request }) {
  11  |   const response = await request.delete('/api/concierge/timeline');
  12  |   expect(response.ok()).toBe(true);
  13  | }
  14  | 
  15  | test.describe('Core API Workflows and URL Accessibility', () => {
  16  |   // Use a hook to ensure the timeline is clear before each test
  17  |   test.beforeEach(clearAgentTimeline);
  18  | 
  19  |   test('should render the main chat interface at the base URL', async ({ page }) => {
  20  |     // This test verifies that the baseURL is reachable and renders the main UI.
  21  |     // It checks for the presence of the initial assistant message.
  22  |     await page.goto('/');
  23  |     const welcomeMessage = page.getByText('AiDevOps System Status: ONLINE.');
  24  |     await expect(welcomeMessage).toBeVisible();
  25  |   });
  26  | 
  27  |   test('should get a streaming response from the chat API', async ({ request }) => {
  28  |     const userMessage = 'Hello, assistant!';
  29  |     // This test verifies the primary chat endpoint is responsive and returns a stream.
  30  |     const response = await request.post('/api/chat', {
  31  |       data: {
  32  |         messages: [{ role: 'user', content: userMessage }],
  33  |         model: 'gpt-4o-mini', // The API requires a model to be specified.
  34  |       },
  35  |     });
  36  | 
  37  |     expect(response.ok()).toBe(true);
  38  |     // For a streaming response, we verify the content type and ensure the body is not empty.
  39  |     expect(response.headers()['content-type']).toContain('text/plain');
  40  |     const responseBody = await response.text();
  41  |     expect(responseBody).not.toBe('');
  42  |   });
  43  | 
  44  |   test('should successfully ingest a text file', async ({ request }) => {
  45  |     // Create a dummy file for testing
  46  |     const filePath = path.join(__dirname, 'test-doc.txt');
  47  |     const fileContent = 'This is a test document for ingestion.';
  48  |     fs.writeFileSync(filePath, fileContent);
  49  |     try {
  50  |       const fileBuffer = fs.readFileSync(filePath);
  51  | 
  52  |       const response = await request.post('/api/ingest', {
  53  |         multipart: {
  54  |           document: {
  55  |             name: 'test-doc.txt',
  56  |             mimeType: 'text/plain',
  57  |             buffer: fileBuffer,
  58  |           },
  59  |         },
  60  |       });
  61  | 
  62  |       expect(response.ok()).toBe(true);
  63  |       const responseBody = await response.json();
  64  |       expect(responseBody.message).toContain('Successfully ingested');
  65  |     } finally {
  66  |       // Ensure clean up even if expectations fail
  67  |       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  68  |     }
  69  |   });
  70  | 
  71  |   test('should successfully ingest a URL', async ({ request }) => {
  72  |     // Using a known, reliable, and simple page for testing.
  73  |     const testUrl = 'https://info.cern.ch/hypertext/WWW/TheProject.html';
  74  | 
  75  |     const response = await request.post('/api/ingest', {
  76  |       multipart: {
  77  |         url: testUrl,
  78  |       },
  79  |     });
  80  | 
> 81  |     expect(response.ok()).toBe(true);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  82  |     const responseBody = await response.json();
  83  |     expect(responseBody.message).toContain('Successfully ingested');
  84  |   });
  85  | 
  86  |   test('should handle API error for a bad URL during ingestion', async ({ request }) => {
  87  |     const response = await request.post('/api/ingest', {
  88  |       multipart: {
  89  |         url: 'http://thissitedoesnotexist.fail',
  90  |       },
  91  |     });
  92  | 
  93  |     expect(response.status()).toBe(400);
  94  |     const responseBody = await response.json();
  95  |     expect(responseBody.error).toContain('Failed to load');
  96  |   });
  97  | });
  98  | 
  99  | test.describe('Full End-to-End UI/UX Scenarios', () => {
  100 |   test.beforeEach(clearAgentTimeline);
  101 | 
  102 |   test('should perform a RAG chat interaction and verify agent timeline', async ({ page, request }) => {
  103 |     await page.goto('/');
  104 | 
  105 |     // 1. Ask a question that will trigger the RAG tool
  106 |     const ragQuestion = 'What is AiDevOps?';
  107 |     const chatInput = page.getByPlaceholder(/Ask a question/i);
  108 |     const sendButton = page.locator('button[type="submit"]');
  109 | 
  110 |     await chatInput.fill(ragQuestion);
  111 |     await sendButton.click();
  112 | 
  113 |     // UX Regression Check: Verify interaction is locked and loading states appear
  114 |     await expect(sendButton).toBeDisabled();
  115 |     await expect(chatInput).toBeDisabled();
  116 |     await expect(page.locator('.animate-bounce')).toBeVisible();
  117 | 
  118 |     // 2. Wait for and verify the assistant's response
  119 |     const assistantResponse = page.locator('.message-bubble.assistant').last();
  120 |     await expect(assistantResponse).toBeVisible({ timeout: 15000 }); // Wait up to 15s for the agent
  121 |     await expect(assistantResponse).not.toBeEmpty();
  122 |     // Checks for general project context to be more resilient to model variations
  123 |     await expect(assistantResponse).toContainText(/dashboard|Operations|AiDevOps/i);
  124 | 
  125 |     // 3. Verify the agent timeline API shows that the RAG tool was used
  126 |     const timelineResponse = await request.get('/api/concierge/timeline');
  127 |     expect(timelineResponse.ok()).toBe(true);
  128 |     const timelineData = await timelineResponse.json();
  129 |     expect(timelineData).toHaveProperty('events');
  130 |     const toolUsedEvent = timelineData.events.find(event => event.type === 'Tool Used');
  131 |     expect(toolUsedEvent).toBeDefined();
  132 |     expect(toolUsedEvent.message).toContain('RAG Assistant searching');
  133 |   });
  134 | 
  135 |   test('should handle document upload via URL from the UI', async ({ page }) => {
  136 |     await page.goto('/');
  137 | 
  138 |     // 1. Open the document upload modal
  139 |     await page.locator('button:has-text("Upload Document")').click();
  140 |     const modalTitle = page.locator('h2:has-text("Upload to Knowledge Base")');
  141 |     await expect(modalTitle).toBeVisible();
  142 | 
  143 |     // 2. Switch to the URL tab and fill in the input
  144 |     await page.locator('button:has-text("From URL")').click();
  145 |     const urlInput = page.locator('input[type="url"]');
  146 |     await expect(urlInput).toBeVisible();
  147 |     await urlInput.fill('https://info.cern.ch/hypertext/WWW/TheProject.html');
  148 | 
  149 |     // 3. Submit the form and wait for the success feedback
  150 |     await page.locator('button:has-text("Ingest")').click();
  151 |     const feedbackMessage = page.locator('p:text-matches("Successfully ingested URL")');
  152 |     await expect(feedbackMessage).toBeVisible({ timeout: 10000 });
  153 | 
  154 |     // 4. Verify the modal closes automatically after success
  155 |     await expect(modalTitle).not.toBeVisible({ timeout: 5000 });
  156 |   });
  157 | 
  158 |   test('should handle document upload via File from the UI', async ({ page }) => {
  159 |     // Create a dummy file for uploading
  160 |     const filePath = path.join(__dirname, 'ui-upload-test.txt');
  161 |     const fileContent = 'This is a test document for UI file upload.';
  162 |     fs.writeFileSync(filePath, fileContent);
  163 |     try {
  164 |       await page.goto('/');
  165 | 
  166 |       // 1. Open the document upload modal
  167 |       await page.locator('button:has-text("Upload Document")').click();
  168 |       const modalTitle = page.locator('h2:has-text("Upload to Knowledge Base")');
  169 |       await expect(modalTitle).toBeVisible();
  170 | 
  171 |       // 2. Set the file for the input
  172 |       const fileChooserPromise = page.waitForEvent('filechooser');
  173 |       await page.locator('label:has-text("Click to upload")').click();
  174 |       const fileChooser = await fileChooserPromise;
  175 |       await fileChooser.setFiles(filePath);
  176 | 
  177 |       // 3. Submit the form and wait for success
  178 |       await page.locator('button:has-text("Ingest")').click();
  179 |       const feedbackMessage = page.locator('p:text-matches("Successfully ingested ui-upload-test.txt")');
  180 |       await expect(feedbackMessage).toBeVisible({ timeout: 10000 });
  181 |     } finally {
```