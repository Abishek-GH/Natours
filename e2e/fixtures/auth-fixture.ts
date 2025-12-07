import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';

type AuthFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('abishek3622@gmail.com', 'admin@1234');

    await use(page);
  },
});

export { expect } from '@playwright/test';
