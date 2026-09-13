import type { CSSProperties } from 'react'

import type { CardData } from '@/shared/socket'

export type PlayingCardSize = 'sm' | 'md' | 'lg'

export type PlayingCardParams = {
  card: CardData
  size?: PlayingCardSize
  selected?: boolean
  dimmed?: boolean
  className?: string
  /** Only for a per-instance dynamic value Tailwind can't express (e.g. an
   * index-driven rotation/z-index in a fanned stack) — see AGENTS.md. */
  style?: CSSProperties
}
