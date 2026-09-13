import { Injectable } from "@nestjs/common"

import { makeUUID } from "../common/utils/id.util"
import { Player, PlayerInput } from "../common/types"
import { PlayerRepository } from "./player.repository"

@Injectable()
export class PlayerService {
	constructor (private readonly playerRepository: PlayerRepository) {}

	async setPlayerData (playerData: PlayerInput): Promise<Player> {
		const player: Player = {
			id: playerData.id || makeUUID(),
			name: playerData.name,
		}

		await this.playerRepository.setPlayerData(player)

		return player
	}

	async getPlayerData (playerId: string): Promise<Player | null> {
		return this.playerRepository.getPlayerData(playerId)
	}

	async playerExists (playerId: string): Promise<boolean> {
		const player = await this.playerRepository.getPlayerData(playerId)

		return Boolean(player)
	}

	async getAllPlayerIds (): Promise<string[]> {
		return this.playerRepository.getAllPlayerIds()
	}
}
