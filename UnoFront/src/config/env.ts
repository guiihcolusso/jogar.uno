import { z } from 'zod'

import packageJson from '../../package.json'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  NEXT_PUBLIC_ENV: z.enum(['development', 'production', 'test']).default('test'),
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),

  // REST API (game list, card list) — served by the UNO backend.
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:5000'),
  // socket.io endpoint — usually the same host as the REST API.
  NEXT_PUBLIC_SOCKET_URL: z.string().url().default('http://localhost:5000'),
  // Static card art (svgs) host — `${NEXT_PUBLIC_ASSETS_URL}/cards/${type}/${color}.svg`.
  NEXT_PUBLIC_ASSETS_URL: z.string().url().default('http://localhost:5000'),

  FEATURE_FLAGS_PROVIDER: z.enum(['config', 'growthbook']).default('config'),

  TESTING: z.enum(['true', 'false']).optional(),
})

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,

  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_ASSETS_URL: process.env.NEXT_PUBLIC_ASSETS_URL,

  FEATURE_FLAGS_PROVIDER: process.env.FEATURE_FLAGS_PROVIDER,

  TESTING: process.env.TESTING,
})

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables. See logs above.')
}

export const env = {
  ...parsed.data,
  APP_ENV: parsed.data.NEXT_PUBLIC_ENV ?? parsed.data.NODE_ENV,
  VERSION: packageJson.version,
} as const

export type Env = typeof env
