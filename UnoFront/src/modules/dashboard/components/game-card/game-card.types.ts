import type { Game } from '@/shared/socket'

export type GameCardParams = {
  game: Game
  onOpen: (gameId: string) => void
}
