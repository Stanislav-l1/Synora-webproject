import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows login CTA in landing navbar', async ({ page }) => {
    await page.goto('/');

    // Landing nav has a "Sign in" link wired to /login.
    const loginLink = page.getByRole('link', { name: /(sign in|войти)/i }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
