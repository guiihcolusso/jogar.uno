import { Global, Logger, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import Redis from "ioredis"

import { IOREDIS_CLIENT } from "./redis.constants"

/**
 * Global module exposing a single ioredis client (used by every domain
 * repository for data persistence). The pub/sub clients used to fan socket.io
 * events out across processes live separately, in RedisIoAdapter, since they
 * need to exist before the Nest app context is fully attached to an HTTP
 * server (see main.ts).
 */
@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: IOREDIS_CLIENT,
			inject: [ConfigService],
			useFactory: (configService: ConfigService): Redis => {
				const logger = new Logger("Redis")

				const client = new Redis({
					host: configService.get<string>("REDIS_HOST", "localhost"),
					port: configService.get<number>("REDIS_PORT", 6379),
					password: configService.get<string>("REDIS_PASSWORD") || undefined,
					lazyConnect: false,
					retryStrategy: times => Math.min(times * 200, 5000),
				})

				client.on("error", error => logger.error(`Redis connection error: ${error.message}`))
				client.on("connect", () => logger.log("Connected to Redis"))

				return client
			},
		},
	],
	exports: [IOREDIS_CLIENT],
})
export class RedisModule {}
