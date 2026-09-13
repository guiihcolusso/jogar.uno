/**
 * Futuristic design tokens for the UNO table — dark-hero neon palette,
 * glassmorphism surfaces and glow effects. Mirrors the CSS custom properties
 * defined in `globals.css`; kept here too so non-Tailwind consumers (canvas
 * drawing, inline `style` where Tailwind truly can't express a dynamic
 * value, framer-motion `boxShadow` targets) share the same source of truth.
 */
export const TOKENS = {
  colors: {
    accent: '#8b5cf6', // electric violet
    accent2: '#ec4899', // magenta
    accent3: '#22d3ee', // cyan
  },
  glow: {
    accent: '0 0 24px -4px rgba(139, 92, 246, 0.8)',
    accent2: '0 0 24px -4px rgba(236, 72, 153, 0.8)',
    accent3: '0 0 24px -4px rgba(34, 211, 238, 0.8)',
    playable: '0 0 18px 2px rgba(34, 211, 238, 0.65)',
    danger: '0 0 24px -4px rgba(239, 68, 68, 0.8)',
  },
  blur: {
    panel: '18px',
  },
  /** Neon glow colors keyed by the UNO card color enum — used for the
   * discard pile ring, hand highlights and the color-picker buttons. */
  cardColors: {
    red: { base: '#ef4444', glow: 'rgba(239, 68, 68, 0.75)' },
    yellow: { base: '#eab308', glow: 'rgba(234, 179, 8, 0.75)' },
    green: { base: '#22c55e', glow: 'rgba(34, 197, 94, 0.75)' },
    blue: { base: '#3b82f6', glow: 'rgba(59, 130, 246, 0.75)' },
    black: { base: '#18181b', glow: 'rgba(139, 92, 246, 0.75)' },
    '': { base: '#71717a', glow: 'rgba(113, 113, 122, 0.5)' },
  },
} as const

export type Tokens = typeof TOKENS
