'use client'

import type { FeatureFlagName } from './feature-flags.types'
import { getProvider } from './providers'

export interface UseFeatureFlagResult {
  isEnabled: boolean
}

export function useFeatureFlag(name: FeatureFlagName): UseFeatureFlagResult {
  const provider = getProvider()
  return { isEnabled: provider.evaluateSync(name) }
}
