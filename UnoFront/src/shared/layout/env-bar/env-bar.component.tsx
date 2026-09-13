import { TriangleAlert } from 'lucide-react'

export type EnvBarEnv = 'development' | 'test' | 'production'

export interface EnvBarProps {
  env: EnvBarEnv
}

export const EnvBar = ({ env }: EnvBarProps) => {
  if (env === 'production') return null

  const label = env === 'development' ? 'DEV' : 'QA'

  return (
    <div className="flex w-full items-center justify-center gap-1 bg-[#DE771E] text-sm text-white">
      <TriangleAlert size={15} />
      <span className="font-bold">You are on the {label} environment</span>
    </div>
  )
}
