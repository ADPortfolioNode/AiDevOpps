# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Full End-to-End UI/UX Scenarios >> should perform a RAG chat interaction and verify agent timeline
- Location: api.spec.ts:104:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.message-bubble.user')
Expected substring: "What is AiDevOps?"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('.message-bubble.user')

```

```yaml
- navigation:
  - text: AiDevOps
  - button "Upload Document"
  - button "New Chat"
- complementary "AI Chat":
  - paragraph: "AiDevOps System Status: ONLINE. All systems operational. How can I assist you today?"
  - textbox "Ask a question...": What is AiDevOps?
  - button "Send"
- main:
  - paragraph: Concierge Agent
  - heading "Your AI Operations Partner" [level=1]
  - paragraph: Streamline your workflow by ingesting documents and delegating tasks. Use the quick actions below or start a conversation in the chat panel.
  - heading "Quick Actions" [level=2]
  - text: 🎯
  - heading "Achieve Your Goals" [level=3]
  - paragraph: Set and track your objectives.
  - text: Create a 4-week goal to migrate our REST API to GraphQL. Break down the "Q3 Marketing Campaign" into smaller tasks. 🤖
  - heading "Automate Your Work" [level=3]
  - paragraph: Find repetitive tasks to automate.
  - text: Draft a script to auto-reply to common customer support questions. Can you automate the weekly report generation? 🗺️
  - heading "Plan Your Strategy" [level=3]
  - paragraph: Brainstorm and outline strategies.
  - text: Outline a go-to-market strategy for a new SaaS product. What are the key pillars of a successful content marketing strategy? 🗂️
  - heading "Manage Your Workspace" [level=3]
  - paragraph: Organize and manage your projects.
  - text: Summarize the key decisions from the "Project Phoenix" documents. What are the next steps for the "Website Redesign" project?
  - button "Activity Timeline ▼":
    - heading "Activity Timeline" [level=3]
    - text: ▼
  - button "System Stats ▼":
    - heading "System Stats" [level=3]
    - text: ▼
  - paragraph: "12"
  - paragraph: Tasks
  - paragraph: 94%
  - paragraph: Hit Rate
  - paragraph: $1.23
  - paragraph: Cost
  - button "Automated Workflows ▼":
    - heading "Automated Workflows" [level=3]
    - text: ▼
  - paragraph: CI/CD Build Analysis
  - text: active
  - paragraph: Automated Code Refactoring
  - text: active
  - paragraph: Security Vulnerability Scan
  - text: inactive
- contentinfo:
  - heading "Agent Activity" [level=3]
  - text: "ID: LOADING..."
```

# Test source

```ts
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
  81  |     expect(response.ok()).toBe(true);
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
  100 |   // UI flows share one server instance — run serially to avoid cross-test interference.
  101 |   test.describe.configure({ mode: 'serial' });
  102 |   test.beforeEach(clearAgentTimeline);
  103 | 
  104 |   test('should perform a RAG chat interaction and verify agent timeline', async ({ page, request }) => {
  105 |     await page.goto('/');
  106 | 
  107 |     // 1. Ask a question that will trigger the RAG tool
  108 |     const ragQuestion = 'What is AiDevOps?';
  109 |     const chatPanel = page.getByRole('complementary', { name: 'AI Chat' });
  110 |     const chatInput = chatPanel.getByPlaceholder(/Ask a question/i);
  111 |     const sendButton = chatPanel.getByRole('button', { name: 'Send', exact: true });
  112 | 
  113 |     await chatInput.fill(ragQuestion);
  114 |     await sendButton.click();
  115 | 
  116 |     // UX regression: loading state (allow brief window before stream completes)
  117 |     await expect(sendButton).toBeDisabled({ timeout: 2000 }).catch(() => undefined);
  118 |     await expect(page.locator('.animate-bounce')).toBeVisible({ timeout: 5000 }).catch(() => undefined);
  119 | 
  120 |     // 2. Wait for the user message and a new assistant reply (not just the welcome message)
> 121 |     await expect(page.locator('.message-bubble.user')).toContainText(ragQuestion, { timeout: 10000 });
      |                                                        ^ Error: expect(locator).toContainText(expected) failed
  122 |     const assistantMessages = page.locator('.message-bubble.assistant');
  123 |     await expect(assistantMessages).toHaveCount(2, { timeout: 15000 });
  124 |     const assistantResponse = assistantMessages.last();
  125 |     await expect(assistantResponse).toContainText(/dashboard|Operations Management|knowledge base/i);
  126 | 
  127 |     // 3. Verify the agent timeline API shows that the RAG tool was used
  128 |     const timelineResponse = await request.get('/api/concierge/timeline');
  129 |     expect(timelineResponse.ok()).toBe(true);
  130 |     const timelineData = await timelineResponse.json();
  131 |     expect(timelineData).toHaveProperty('events');
  132 |     const toolUsedEvent = timelineData.events.find(event => event.type === 'Tool Used');
  133 |     expect(toolUsedEvent).toBeDefined();
  134 |     expect(toolUsedEvent.message).toContain('RAG Assistant searching');
  135 |   });
  136 | 
  137 |   test('should handle document upload via URL from the UI', async ({ page }) => {
  138 |     await page.goto('/');
  139 | 
  140 |     // 1. Open the document upload modal
  141 |     await page.locator('button:has-text("Upload Document")').click();
  142 |     const modalTitle = page.locator('h2:has-text("Upload to Knowledge Base")');
  143 |     await expect(modalTitle).toBeVisible();
  144 | 
  145 |     // 2. Switch to the URL tab and fill in the input
  146 |     await page.locator('button:has-text("From URL")').click();
  147 |     const urlInput = page.locator('input[type="url"]');
  148 |     await expect(urlInput).toBeVisible();
  149 |     await urlInput.fill('https://info.cern.ch/hypertext/WWW/TheProject.html');
  150 | 
  151 |     // 3. Submit the form and wait for the success feedback
  152 |     await page.locator('button:has-text("Ingest")').click();
  153 |     const feedbackMessage = page.locator('p:text-matches("Successfully ingested URL")');
  154 |     await expect(feedbackMessage).toBeVisible({ timeout: 10000 });
  155 | 
  156 |     // 4. Verify the modal closes automatically after success
  157 |     await expect(modalTitle).not.toBeVisible({ timeout: 5000 });
  158 |   });
  159 | 
  160 |   test('should handle document upload via File from the UI', async ({ page }) => {
  161 |     // Create a dummy file for uploading
  162 |     const filePath = path.join(__dirname, 'ui-upload-test.txt');
  163 |     const fileContent = 'This is a test document for UI file upload.';
  164 |     fs.writeFileSync(filePath, fileContent);
  165 |     try {
  166 |       await page.goto('/');
  167 | 
  168 |       // 1. Open the document upload modal
  169 |       await page.locator('button:has-text("Upload Document")').click();
  170 |       const modalTitle = page.locator('h2:has-text("Upload to Knowledge Base")');
  171 |       await expect(modalTitle).toBeVisible();
  172 | 
  173 |       // 2. Set the file for the input
  174 |       const fileChooserPromise = page.waitForEvent('filechooser');
  175 |       await page.locator('label:has-text("Click to upload")').click();
  176 |       const fileChooser = await fileChooserPromise;
  177 |       await fileChooser.setFiles(filePath);
  178 | 
  179 |       // 3. Submit the form and wait for success
  180 |       await page.locator('button:has-text("Ingest")').click();
  181 |       const feedbackMessage = page.locator('p:text-matches("Successfully ingested ui-upload-test.txt")');
  182 |       await expect(feedbackMessage).toBeVisible({ timeout: 10000 });
  183 |     } finally {
  184 |       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  185 |     }
  186 |   });
  187 | });
```