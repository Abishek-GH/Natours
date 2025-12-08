// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'e2e.env') });

export default defineConfig({
  testDir: './tests',

  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Global setup file
  // globalSetup: './global-setup.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'monocart-reporter',
      { name: 'My Test Report', outputFile: 'e2e/test-results/monocart-report.json' },
    ],
    ['allure-playwright', { outputFolder: 'e2e/test-results/allure-results' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    // Default storage state for ALL tests
    // storageState: 'e2e/.auth/user.json',
  },

  // Projects also implicitly use storageState
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-safari',
      use: {
        browserName: 'webkit', // iOS Safari uses WebKit
        ...devices['iPhone 13'], // iPhone 13 emulation
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium', // Android Chrome uses Chromium
        ...devices['Pixel 5'], // Pixel 5 emulation
      },
    },
  ],

  outputDir: 'e2e/test-results',
});
