export const FEATURE_FLAGS = {
  'example-flag': {
    default: false,
    envOverride: 'FF_EXAMPLE_FLAG',
    owner: 'time-frontend',
    cleanupBy: '2026-12-31',
  },
} as const satisfies Record<
  string,
  {
    default: boolean
    envOverride?: string
    owner: string
    cleanupBy: string
  }
>

export type FeatureFlagName = keyof typeof FEATURE_FLAGS
