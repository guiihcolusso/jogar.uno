import { FEATURE_FLAGS } from '@/config/feature-flags'

import type { FeatureFlagName, FeatureFlagsProvider } from '../feature-flags.types'

export const configProvider: FeatureFlagsProvider = {
  evaluateSync(name: FeatureFlagName): boolean {
    const flag = FEATURE_FLAGS[name]
    if (!flag) return false

    const override = flag.envOverride ? process.env[flag.envOverride] : undefined
    if (override === 'true') return true
    if (override === 'false') return false

    return flag.default
  },

  async evaluate(name: FeatureFlagName): Promise<boolean> {
    return this.evaluateSync(name)
  },
}
