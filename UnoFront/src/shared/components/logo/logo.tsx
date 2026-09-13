import { cn } from '@/shared/utils'

export type LogoParams = {
  className?: string
}

/**
 * Wordmark used across the app chrome. Text-based (not the old raster PNG)
 * so it scales cleanly and can pick up the neon glow tokens.
 */
export const Logo = ({ className }: LogoParams) => (
  <span
    className={cn(
      'bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-2xl font-black tracking-tight text-transparent drop-shadow-[0_0_12px_var(--accent)]',
      className,
    )}
  >
    UNO
  </span>
)
