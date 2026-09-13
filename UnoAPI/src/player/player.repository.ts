import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"

import { IOREDIS_CLIENT } from "../redis/redis.constants"
import { RedisJsonStore } from "../redis/redis-json-store"
import { Player } from "../common/types"

@Injectable()
export class PlayerRepository {
	private readonly store: RedisJsonStore<Player>

	constructor (@Inject(IOREDIS_CLIENT) redis: Redis) {
		this.store = new RedisJsonStore<Player>(redis, "player")
	}

	async setPlayerData (playerData: Player): Promise<void> {
		await this.store.set(playerData.id, playerData)
	}

	async getPlayerData (playerId: string): Promise<Player | null> {
		return this.store.getOne(playerId)
	}

	async getAllPlayerIds (): Promise<string[]> {
		return this.store.getKeys()
	}
}
