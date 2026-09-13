import { Injectable } from "@nestjs/common"

import { SocketEmitterService } from "../common/realtime/socket-emitter.service"
import { GameHistoryConsolidatedEventData } from "../common/types"
import { PlayerService } from "../player/player.service"
import { GameHistoryService } from "./game-history.service"

/**
 * Fans out the two "please refresh" pushes that follow every "big" game
 * event (GameStarted/GameEnded/PlayerJoined/PlayerLeft/...): a per-player
 * consolidated history push, and a broadcast empty "list changed" nudge.
 */
@Injectable()
export class ClientDispatchService {
	constructor (
		private readonly playerService: PlayerService,
		private readonly gameHistoryService: GameHistoryService,
		private readonly socketEmitter: SocketEmitterService,
	) {}

	async dispatchGameHistoryConsolidated (playerId?: string): Promise<void> {
		const connectedPlayerIds = playerId ? [playerId] : await this.playerService.getAllPlayerIds()

		await Promise.all(
			connectedPlayerIds.map(async id => {
				const gameHistory = await this.gameHistoryService.retrieveGameHistory(id)

				if (gameHistory) {
					this.socketEmitter.emitToRoom<GameHistoryConsolidatedEventData>("player", id, "GameHistoryConsolidated", { gameHistory })
				}
			}),
		)
	}

	async dispatchGameListUpdated (): Promise<void> {
		const connectedPlayerIds = await this.playerService.getAllPlayerIds()

		connectedPlayerIds.forEach(playerId => {
			this.socketEmitter.emitToRoom("player", playerId, "GameListUpdated", {})
		})
	}
}
