import { Module } from "@nestjs/common"

import { ChatModule } from "../chat/chat.module"
import { GameModule } from "../game/game.module"
import { PlayerModule } from "../player/player.module"
import { EventsGateway } from "./events.gateway"

@Module({
	imports: [PlayerModule, ChatModule, GameModule],
	providers: [EventsGateway],
})
export class EventsModule {}
