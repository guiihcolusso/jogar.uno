import { INestApplicationContext, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import Redis from "ioredis"
import { Server, ServerOptions } from "socket.io"

/**
 * Wires socket.io's Redis adapter (@socket.io/redis-adapter, the maintained
 * successor to the deprecated socket.io-redis the old server used) so events
 * fan out correctly across horizontally-scaled instances via Redis pub/sub.
 */
export class RedisIoAdapter extends IoAdapter {
	private readonly logger = new Logger(RedisIoAdapter.name)
	private adapterConstructor!: ReturnType<typeof createAdapter>

	constructor (private readonly app: INestApplicationContext) {
		super(app)
	}

	async connectToRedis (): Promise<void> {
		const configService = this.app.get(ConfigService)

		const redisOptions = {
			host: configService.get<string>("REDIS_HOST", "localhost"),
			port: configService.get<number>("REDIS_PORT", 6379),
			password: configService.get<string>("REDIS_PASSWORD") || undefined,
		}

		const pubClient = new Redis(redisOptions)
		const subClient = pubClient.duplicate()

		pubClient.on("error", error => this.logger.error(`Redis pub client error: ${error.message}`))
		subClient.on("error", error => this.logger.error(`Redis sub client error: ${error.message}`))

		this.adapterConstructor = createAdapter(pubClient, subClient)
	}

	createIOServer (port: number, options?: ServerOptions): Server {
		const server: Server = super.createIOServer(port, options)

		server.adapter(this.adapterConstructor)

		return server
	}
}
