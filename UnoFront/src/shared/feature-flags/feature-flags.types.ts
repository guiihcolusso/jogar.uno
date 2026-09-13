import type { FeatureFlagName } from '@/config/feature-flags'

export type { FeatureFlagName }

export interface EvaluateFlagParams {
  userId?: string
  roles?: string[]
}

export interface FeatureFlagsProvider {
  evaluate(name: FeatureFlagName, ctx?: EvaluateFlagParams): Promise<boolean>
  evaluateSync(name: FeatureFlagName): boolean
}
