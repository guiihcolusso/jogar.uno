import { Injectable } from "@nestjs/common"

import { GameHistory } from "../common/types"
import { GameHistoryRepository } from "./game-history.repository"
import { GameRepository } from "./game.repository"

@Injectable()
export class GameHistoryService {
	constructor (
		private readonly gameHistoryRepository: GameHistoryRepository,
		private readonly gameRepository: GameRepository,
	) {}

	async retrieveGameHistory (playerId: string): Promise<GameHistory[]> {
		return this.consolidateGameHistory(playerId)
	}

	private async consolidateGameHistory (playerId: string): Promise<GameHistory[]> {
		const gameHistory = await this.gameHistoryRepository.getGameHistory(playerId) || []

		const consolidatedGameHistory: GameHistory[] = []

		const games = await this.gameRepository.getGameList()

		gameHistory.forEach(history => {
			const game = games.find(game => game.id === history.gameId)

			if (game) {
				consolidatedGameHistory.push({
					createdAt: game.createdAt,
					gameId: game.id,
					name: game.title,
					playersCount: game.players.length,
					status: game.status,
				})
			}
		})

		games
			.filter(game => game.players.some(player => player.id === playerId))
			.filter(game => !consolidatedGameHistory.some(history => history.gameId === game.id))
			.forEach(game => {
				consolidatedGameHistory.push({
					createdAt: game.createdAt,
					gameId: game.id,
					name: game.title,
					playersCount: game.players.length,
					status: game.status,
				})
			})

		await this.gameHistoryRepository.setGameHistory(playerId, consolidatedGameHistory)

		return consolidatedGameHistory
	}
}
