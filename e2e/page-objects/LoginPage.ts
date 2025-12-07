import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.locator('//input[@id="email"]').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.locator('//input[@id="password"]').fill(password);
  }

  async submit() {
    await this.page.locator('//button[contains(.,"Login")]').click();
  }

  async assertLoggedIn() {
    await expect(this.page.getByText('Logged in successfully!')).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
    await this.assertLoggedIn();
  }
}
