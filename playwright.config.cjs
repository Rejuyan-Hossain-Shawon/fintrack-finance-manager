const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', testMatch: '**/fintrack-portfolio.spec.cjs',
  timeout: 30000, expect: { timeout: 10000 }, workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5174', browserName: 'chromium', headless: true, acceptDownloads: true },
  webServer: [
    { command: 'npm.cmd run start --prefix server', url: 'http://127.0.0.1:5001/api/health', reuseExistingServer: true, timeout: 60000 },
    { command: 'npm.cmd run dev --prefix client', url: 'http://127.0.0.1:5174', reuseExistingServer: true, timeout: 60000 },
  ],
});
