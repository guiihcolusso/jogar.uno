import type { RefObject } from 'react'

import type { CardData } from '@/shared/socket'

export type DiscardPileParams = {
  cards: CardData[]
  amountToBuy: number
  canBuyCard: boolean
  onBuyCard: () => void
  pileRef: RefObject<HTMLDivElement | null>
  isDropTarget?: boolean
}
