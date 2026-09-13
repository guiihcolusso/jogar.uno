import { Module } from "@nestjs/common"

import { PlayerRepository } from "./player.repository"
import { PlayerService } from "./player.service"

@Module({
	providers: [PlayerService, PlayerRepository],
	exports: [PlayerService],
})
export class PlayerModule {}
