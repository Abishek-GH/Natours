import { test, expect } from '../fixtures/auth-fixture';

// Fixtures version
test('user can log in and see dashboard', async ({ loggedInPage }) => {
  await expect(loggedInPage.locator('//nav//a[contains(.,"Log out")]')).toBeVisible();
});

// // Global storage state version
// test('user can log in', async ({ page }) => {
//   await page.pause();
//   await page.goto('/');

//   await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

//   await expect(page.getByTestId('user-email')).toHaveText(
//     process.env.TEST_USER_EMAIL ?? 'test@example.com',
//   );
// });
