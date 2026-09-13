import { Global, Module } from "@nestjs/common"

import { SocketEmitterService } from "./socket-emitter.service"

/**
 * Global leaf module - depends on nothing else in the app, so every other
 * module (player/chat/game/events) can safely import it without creating
 * circular module dependencies.
 */
@Global()
@Module({
	providers: [SocketEmitterService],
	exports: [SocketEmitterService],
})
export class RealtimeModule {}
