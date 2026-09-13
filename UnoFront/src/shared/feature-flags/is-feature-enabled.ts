import type { EvaluateFlagParams, FeatureFlagName } from './feature-flags.types'
import { getProvider } from './providers'

export async function isFeatureEnabled(name: FeatureFlagName, ctx?: EvaluateFlagParams): Promise<boolean> {
  return getProvider().evaluate(name, ctx)
}
