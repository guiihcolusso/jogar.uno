import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"

import { IOREDIS_CLIENT } from "../redis/redis.constants"
import { RedisJsonStore } from "../redis/redis-json-store"
import { GameHistory } from "../common/types"

@Injectable()
export class GameHistoryRepository {
	private readonly store: RedisJsonStore<GameHistory[]>

	constructor (@Inject(IOREDIS_CLIENT) redis: Redis) {
		this.store = new RedisJsonStore<GameHistory[]>(redis, "game-history")
	}

	async getGameHistory (playerId: string): Promise<GameHistory[] | null> {
		return this.store.getOne(playerId)
	}

	async setGameHistory (playerId: string, gameHistory: GameHistory[]): Promise<void> {
		await this.store.set(playerId, gameHistory)
	}
}
