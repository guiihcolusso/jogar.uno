import { Logger, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "./app.module"
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter"
import { RedisIoAdapter } from "./redis/redis-io.adapter"

async function bootstrap (): Promise<void> {
	const logger = new Logger("Bootstrap")

	const app = await NestFactory.create(AppModule)

	app.enableCors({
		origin: true,
	})

	/**
	 * Applies to the REST controllers. The WS gateway uses its own
	 * ValidationPipe (see EventsGateway) so validation failures there throw
	 * a WsException instead of the HTTP-flavoured BadRequestException.
	 */
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	)

	app.useGlobalFilters(new AllExceptionsFilter())

	const redisIoAdapter = new RedisIoAdapter(app)

	await redisIoAdapter.connectToRedis()

	app.useWebSocketAdapter(redisIoAdapter)

	const port = process.env.PORT || 5000

	await app.listen(port)

	logger.log(`Server is running... [PORT ${port}]`)
}

bootstrap()
