import { test, expect } from '@playwright/test';
import { EvaluationFramework } from './lib/evals/framework';

test.describe('Agent Tool Invocation', () => {
  test('should invoke the weather tool and return a result', async ({ page }) => {
    await page.goto('/');

    const chatPanel = page.locator('aside[aria-label="AI Chat"]');
    const chatInput = chatPanel.getByPlaceholder('Ask a question or type a command...');

    // Ask a question that should trigger the weather tool
    await chatInput.fill('What is the weather like in San Francisco?');
    await page.keyboard.press('Enter');

    // Wait for the assistant's response and verify it contains expected content
    const assistantResponse = chatPanel.locator('.message-bubble.assistant').last();
    await expect(assistantResponse).toContainText('San Francisco', { timeout: 15000 });
    await expect(assistantResponse).toContainText('°F', { timeout: 15000 });
  });
});

test.describe('Agent RAG Functionality', () => {
  test('should use RAG to answer a question from context', async ({ request }) => {
    // This test relies on the in-memory vector store persisting between requests
    // during the test run, which is how the dev server behaves.

    // Step 1: Seed the vector store with a piece of information by sending it as a message.
    const contextMessage = 'The secret code for project "Phoenix" is "firebird".';
    const seedResponse = await request.post('/api/concierge/conversation', {
      data: {
        messages: [{ role: 'user', content: contextMessage }],
      },
    });
    // Ensure the seeding call was successful and wait for it to complete.
    expect(seedResponse.ok()).toBe(true);
    await seedResponse.text();

    // Step 2: Ask a question that should be answered using the context from the first message.
    const question = 'What is the secret code for project Phoenix?';
    const ragResponse = await request.post('/api/concierge/conversation', {
      data: {
        messages: [{ role: 'user', content: question }],
      },
    });

    expect(ragResponse.ok()).toBe(true);
    const responseBody = await ragResponse.text();

    // The streaming response text should contain the answer from the RAG context.
    expect(responseBody.toLowerCase()).toContain('firebird');
  });
});

test.describe('Agent Evaluation Framework', () => {
  test('should accurately respond to a question using a tool', async ({ request }) => {
    const question = 'What is the current temperature in San Francisco?';

    const evalResult = await EvaluationFramework.evaluate(
      'ConciergeAgent-WeatherTool',
      async () => {
        const response = await request.post('/api/concierge/conversation', {
          data: {
            messages: [{ role: 'user', content: question }],
          },
        });
        return response.text();
      },
      (responseText) => {
        // Validation: The response should contain the location and a temperature unit.
        const lowercasedResponse = responseText.toLowerCase();
        return lowercasedResponse.includes('san francisco') && lowercasedResponse.includes('f');
      }
    );

    expect(evalResult.accuracyScore).toBe(1.0);
    expect(evalResult.reliabilityScore).toBe(1.0);
    expect(evalResult.latencyMs).toBeLessThan(15000); // Expect a response within 15 seconds
  });
});