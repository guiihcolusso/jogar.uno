import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"

import { IOREDIS_CLIENT } from "../redis/redis.constants"
import { RedisJsonStore } from "../redis/redis-json-store"
import { GameRoundCounter } from "../common/types"

@Injectable()
export class GameRoundRepository {
	private readonly store: RedisJsonStore<GameRoundCounter>

	constructor (@Inject(IOREDIS_CLIENT) redis: Redis) {
		this.store = new RedisJsonStore<GameRoundCounter>(redis, "game-round")
	}

	async getGameRoundCounter (gameId: string): Promise<GameRoundCounter | null> {
		return this.store.getOne(gameId)
	}

	async setGameRoundCounterData (gameId: string, roundCounter: GameRoundCounter): Promise<void> {
		await this.store.set(gameId, roundCounter)
	}

	async deleteGameRoundCounter (gameId: string): Promise<void> {
		await this.store.delete(gameId)
	}
}
