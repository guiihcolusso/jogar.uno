import { GameStatus } from "./game.types"

export interface GameHistory {
	gameId: string
	name: string
	status: GameStatus
	playersCount: number
	createdAt: number
}
