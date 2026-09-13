import Redis from "ioredis"

/**
 * Small helper implementing the same shape as the old in-memory
 * AsyncMapStoreService, but backed by real Redis. Every domain repository
 * (games, players, chats, ...) wraps one of these, namespaced by key
 * prefix, so `namespace:<id>` mirrors the old Map key.
 *
 * Not a DI provider itself (it needs a namespace argument per repository) -
 * repositories construct one internally from the injected ioredis client.
 */
export class RedisJsonStore<Model> {
	private readonly separator = ":"

	constructor (
		private readonly redis: Redis,
		private readonly namespace: string,
	) {}

	async set (id: string, data: Model): Promise<void> {
		await this.redis.set(this.mountKey(id), JSON.stringify(data))
	}

	async delete (id: string): Promise<void> {
		await this.redis.del(this.mountKey(id))
	}

	async getOne (id: string): Promise<Model | null> {
		const raw = await this.redis.get(this.mountKey(id))

		return raw ? JSON.parse(raw) as Model : null
	}

	async getAll (): Promise<Model[]> {
		const keys = await this.getAllCacheKeys()

		if (!keys.length) {
			return []
		}

		const values = await this.redis.mget(...keys)

		return values
			.filter((value): value is string => Boolean(value))
			.map(value => JSON.parse(value) as Model)
	}

	async getKeys (): Promise<string[]> {
		const cacheKeys = await this.getAllCacheKeys()

		return cacheKeys.map(cacheKey => cacheKey.slice(this.namespace.length + this.separator.length))
	}

	private mountKey (id: string): string {
		return `${this.namespace}${this.separator}${id}`
	}

	private async getAllCacheKeys (): Promise<string[]> {
		const pattern = this.mountKey("*")

		let cursor = "0"
		const keys: string[] = []

		do {
			const [nextCursor, batch] = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 100)

			cursor = nextCursor
			keys.push(...batch)
		} while (cursor !== "0")

		return keys
	}
}
