import { Module } from "@nestjs/common"

import { PlayerModule } from "../player/player.module"
import { ChatRepository } from "./chat.repository"
import { ChatService } from "./chat.service"

@Module({
	imports: [PlayerModule],
	providers: [ChatService, ChatRepository],
	exports: [ChatService],
})
export class ChatModule {}
