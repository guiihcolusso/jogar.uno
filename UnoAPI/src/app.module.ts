import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"

import { AppController } from "./app.controller"
import { AssetsModule } from "./static-files/assets.module"
import { RealtimeModule } from "./common/realtime/realtime.module"
import { EventsModule } from "./events/events.module"
import { RedisModule } from "./redis/redis.module"

/**
 * PlayerModule/ChatModule/GameModule (and their REST controllers) are pulled
 * in transitively through EventsModule - no need to list them again here.
 */
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		RedisModule,
		RealtimeModule,
		AssetsModule,
		EventsModule,
	],
	controllers: [AppController],
})
export class AppModule {}
