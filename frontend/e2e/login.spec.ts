import { expect, test } from '@playwright/test';

test.describe('Login flow', () => {
  test('shows server error when credentials are rejected', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
        }),
      }),
    );

    await page.goto('/login');

    await page.locator('input[name="login"]').fill('ghost@example.com');
    await page.locator('input[name="password"]').fill('wrong-pass-123');
    await page.getByRole('button', { name: /(log in|войти)/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    // Should not navigate away on failure.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('routes to /feed on successful login', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'fake-access',
            refreshToken: 'fake-refresh',
          },
        }),
      }),
    );

    await page.route('**/api/v1/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: '00000000-0000-0000-0000-000000000001',
            username: 'tester',
            email: 'tester@example.com',
            displayName: 'Tester',
            avatarUrl: null,
            role: 'USER',
            reputationScore: 0,
          },
        }),
      }),
    );

    // Stub the feed network calls so the page renders something deterministic.
    await page.route('**/api/v1/**', (route) => {
      if (route.request().url().includes('/auth/')) return route.fallback();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { content: [], totalElements: 0 } }),
      });
    });

    await page.goto('/login');
    await page.locator('input[name="login"]').fill('tester@example.com');
    await page.locator('input[name="password"]').fill('hunter22');
    await page.getByRole('button', { name: /(log in|войти)/i }).click();

    await expect(page).toHaveURL(/\/feed$/);
  });
});
