import { env } from '@/config/env'

import type { FeatureFlagsProvider } from '../feature-flags.types'
import { configProvider } from './config.provider'

export function getProvider(): FeatureFlagsProvider {
  switch (env.FEATURE_FLAGS_PROVIDER) {
    case 'growthbook':
      throw new Error('GrowthBook provider não implementado. Use FEATURE_FLAGS_PROVIDER=config.')
    case 'config':
    default:
      return configProvider
  }
}
