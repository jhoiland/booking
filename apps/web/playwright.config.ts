import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  reporter: 'list',
  use: {
    headless: true,
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});