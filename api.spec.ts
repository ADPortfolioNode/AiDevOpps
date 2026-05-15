import { test, expect } from '@playwright/test';

test.describe('Production API Workflows', () => {
  test('should get a streaming response from the conversation API', async ({ request }) => {
    const userMessage = 'Hello, assistant!';
    const response = await request.post('/api/concierge/conversation', {
      data: {
        messages: [{ role: 'user', content: userMessage }],
      },
    });

    // Check if the response is successful
    expect(response.ok()).toBe(true);
    // Check that we received a streaming response
    expect(response.headers()['content-type']).toContain('text/plain');
  });

  test('should get initial conversation history', async ({ request }) => {
    const response = await request.get('/api/concierge/conversation');
    expect(response.ok()).toBe(true);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('conversation');
    expect(Array.isArray(responseBody.conversation)).toBe(true);
    expect(responseBody.conversation.length).toBeGreaterThan(0);
    expect(responseBody.conversation[0].role).toBe('assistant');
  });

  test('should get a successful response from the health API', async ({ request }) => {
    const response = await request.get('/api/concierge/health');

    // Check if the response is successful
    expect(response.ok()).toBe(true);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('status', 'ok');
    expect(responseBody).toHaveProperty('timestamp');
  });

  test('should get a list of integrations', async ({ request }) => {
    const response = await request.get('/api/integrations');
    expect(response.ok()).toBe(true);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('integrations');
    expect(Array.isArray(responseBody.integrations)).toBe(true);
    expect(responseBody.integrations.length).toBeGreaterThan(0);
    expect(responseBody.integrations[0]).toHaveProperty('id');
    expect(responseBody.integrations[0]).toHaveProperty('name');
  });

  test('should get and post to the threads API', async ({ request }) => { // Corrected test description
    const testThreadId = `test-thread-${Date.now()}`;
    const initialMessage = 'Hello from thread test!';

    // Test GET (empty initially)
    const getResponse = await request.get(`/api/threads?threadId=${testThreadId}`);
    expect(getResponse.ok()).toBe(true);
    const getBody = await getResponse.json();
    expect(getBody).toHaveProperty('threadId', testThreadId);
    expect(getBody).toHaveProperty('history');
    expect(Array.isArray(getBody.history)).toBe(true);
    expect(getBody.history).toHaveLength(0);

    // Test POST to add an initial message
    const postInitialResponse = await request.post('/api/threads', {
      data: { threadId: testThreadId, message: { role: 'user', text: initialMessage } }, // Corrected data structure
    });
    expect(postInitialResponse.ok()).toBe(true);

    // Verify GET after POST
    const getUpdatedResponse = await request.get(`/api/threads?threadId=${testThreadId}`);
    expect(getUpdatedResponse.ok()).toBe(true);
    const getUpdatedBody = await getUpdatedResponse.json(); // Corrected variable name
    expect(getUpdatedBody.history).toHaveLength(1);
    expect(getUpdatedBody.history[0].text).toBe(initialMessage);
    expect(getUpdatedBody.history[0].role).toBe('user');
  });
});