// e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  if (!baseURL) {
    throw new Error('baseURL is not defined in playwright.config.ts');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

  await page.context().storageState({ path: 'e2e/.auth/user.json' });

  await browser.close();
}

export default globalSetup;
