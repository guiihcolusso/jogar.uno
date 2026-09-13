import { cn } from '@/shared/utils'

import { styles } from './playing-card.styles'
import type { PlayingCardParams } from './playing-card.types'

/**
 * Renders a single card's art. Backend serves SVGs from an arbitrary,
 * self-hosted `NEXT_PUBLIC_ASSETS_URL` host, so a plain `<img>` is used
 * instead of `next/image` (which would need that host allow-listed in
 * `next.config.ts` at build time).
 */
export const PlayingCard = ({
  card,
  size = 'md',
  selected = false,
  dimmed = false,
  className,
  style,
}: PlayingCardParams) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={card.src}
    alt={card.name}
    draggable={false}
    style={style}
    className={cn(styles.image({ size, selected, dimmed }), className)}
  />
)
