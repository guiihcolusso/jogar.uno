import type { CardColors, CardTypes } from '@/shared/socket'

export type ModMenuParams = {
  gameId: string
}

export type CustomCardDraft = {
  type: CardTypes
  color: CardColors
  count: number
}
