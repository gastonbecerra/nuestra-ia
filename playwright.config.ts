import { defineConfig } from '@playwright/test';
const pages=!!process.env.APP_PAGES;
const port=pages?5174:5173;
const origin=`http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, use: { baseURL:origin, screenshot:'only-on-failure' },
  webServer: { command:pages ? `npm run preview:pages -- --port ${port} --strictPort` : process.env.APP_PREVIEW ? `npm run preview -- --port ${port} --strictPort` : `npm run dev -- --port ${port} --strictPort`, url:pages?`${origin}/nuestra-ia/`:origin, reuseExistingServer:!process.env.CI },
});
