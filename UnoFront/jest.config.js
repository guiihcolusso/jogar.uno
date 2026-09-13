// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '\\.e2e\\.ts$'],
  coverageReporters: [
    'clover',
    'text',
    'json',
    'lcov',
    [
      'cobertura',
      {
        outputDirectory: 'coverage',
        outputName: 'cobertura-coverage.xml',
      },
    ],
  ],
  coverageDirectory: './coverage',
  globals: { fetch },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@heroui/react$': '<rootDir>/__mocks__/@heroui/react.js',
    '^@heroui/styles$': '<rootDir>/__mocks__/@heroui/styles.js',
  },
}

// `next/jest` retorna uma função async; rodamos a config dele e
// reescrevemos `transformIgnorePatterns` para deixar `next-intl`
// (e seus pares ESM) passarem pelo SWC. Sem isto, Jest vê `export ...`
// cru e quebra com SyntaxError. Como pnpm coloca os pacotes em
// `node_modules/.pnpm/...`, replicamos os dois padrões (resolução
// direta e caminho `.pnpm`) que o `next/jest` aplica a `next/dist`.
const ESM_PACKAGES = [
  'next-intl',
  'use-intl',
  '@formatjs',
  '@formatjs/fast-memoize',
  '@formatjs/icu-messageformat-parser',
  '@formatjs/icu-skeleton-parser',
  '@formatjs/intl-localematcher',
  'intl-messageformat',
  'jose',
  'next-auth',
  '@auth/core',
  '@panva',
]
const ESM_PNPM_PACKAGES = ESM_PACKAGES.map((p) => p.replace('/', '+'))

module.exports = async () => {
  const baseConfig = await createJestConfig(config)()
  return {
    ...baseConfig,
    transformIgnorePatterns: [
      `/node_modules/(?!.pnpm)(?!(geist|${ESM_PACKAGES.join('|')}|next/dist/client|next/dist/shared/lib|next/src/client|next/src/shared/lib)/)`,
      `/node_modules[\\\\/]\\.pnpm[\\\\/](?!(geist|${ESM_PNPM_PACKAGES.join('|')}|next\\+dist\\+client|next\\+dist\\+shared\\+lib|next\\+src\\+client|next\\+src\\+shared\\+lib)@)(?!.*node_modules[\\\\/](geist|${ESM_PACKAGES.join('|')}|next[\\\\/]dist[\\\\/]client|next[\\\\/]dist[\\\\/]shared[\\\\/]lib|next[\\\\/]src[\\\\/]client|next[\\\\/]src[\\\\/]shared[\\\\/]lib)[\\\\/])`,
      '^.+\\.module\\.(css|sass|scss)$',
    ],
  }
}
