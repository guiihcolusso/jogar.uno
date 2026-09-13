import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"

import { IOREDIS_CLIENT } from "../redis/redis.constants"
import { RedisJsonStore } from "../redis/redis-json-store"
import { Game } from "../common/types"

@Injectable()
export class GameRepository {
	private readonly store: RedisJsonStore<Game>

	constructor (@Inject(IOREDIS_CLIENT) redis: Redis) {
		this.store = new RedisJsonStore<Game>(redis, "game")
	}

	async setGameData (gameId: string, game: Game): Promise<void> {
		await this.store.set(gameId, game)
	}

	async getGame (gameId: string): Promise<Game | null> {
		return this.store.getOne(gameId)
	}

	async getGameList (): Promise<Game[]> {
		return this.store.getAll()
	}
}
