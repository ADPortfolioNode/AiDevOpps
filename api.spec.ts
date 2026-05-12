import { test, expect } from '@playwright/test';

test.describe('API Workflows', () => {
  test('should return a welcome message from the hello API', async ({ request }) => {
    const response = await request.get('/api/hello');

    // Check that the response was successful
    expect(response.ok()).toBeTruthy();

    // Check that the response body is correct
    expect(await response.json()).toEqual({ name: 'John Doe' });
  });
});