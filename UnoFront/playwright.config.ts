import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config para E2E.
 *
 * Specs E2E vivem co-localizadas em cada módulo como `{nome}.e2e.ts` (ex.:
 * `src/modules/products/products.e2e.ts`). `testDir` aponta para `src/` e
 * `testMatch` filtra por extensão `.e2e.ts`.
 *
 * Bypass de auth: NÃO setamos `TESTING=true` globalmente — cada spec que precisa
 * de bypass adiciona o cookie `e2e_auth_bypass=true` em `beforeEach`. Assim os
 * testes que validam o redirect de auth podem rodar sem bypass.
 *
 * MSW: o `webServer` sobe `pnpm dev` com `NEXT_PUBLIC_API_MOCKING=enabled`,
 * portanto os handlers em `src/modules/{m}/mocks/` ficam ativos durante os specs.
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_MOCKING: 'enabled',
    },
  },
})
