import type { RefObject } from 'react'

import type { PlayerData } from '@/shared/socket'

export type PlayerHandParams = {
  player: PlayerData
  pileRef: RefObject<HTMLDivElement | null>
  onPlayCards: (cardIds: string[]) => void
  onGoOnline: () => void
  onDropTargetChange: (isOver: boolean) => void
}
