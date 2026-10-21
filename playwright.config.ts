import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/features/cart/tests",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
  webServer: [
    { command: "node src/features/cart/tests/catalogFixture.mts", url: "http://127.0.0.1:3101/health", reuseExistingServer: false },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3101", NEXT_PUBLIC_SUPABASE_ANON_KEY: "cart-test-public-key", NEXT_DIST_DIR: ".next-cart-test" },
    },
  ],
});
