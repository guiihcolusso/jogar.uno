import { Module } from "@nestjs/common"

import { PlayerModule } from "../player/player.module"
import { CardController } from "./card.controller"
import { CardService } from "./card.service"
import { ClientDispatchService } from "./client-dispatch.service"
import { GameController } from "./game.controller"
import { GameEngineService } from "./game-engine.service"
import { GameHistoryRepository } from "./game-history.repository"
import { GameHistoryService } from "./game-history.service"
import { GameRepository } from "./game.repository"
import { GameRoundRepository } from "./game-round.repository"
import { GameRoundService } from "./game-round.service"
import { GameService } from "./game.service"

@Module({
	imports: [PlayerModule],
	controllers: [GameController, CardController],
	providers: [
		GameService,
		GameEngineService,
		GameRoundService,
		GameHistoryService,
		ClientDispatchService,
		CardService,
		GameRepository,
		GameRoundRepository,
		GameHistoryRepository,
	],
	exports: [GameService, CardService, GameEngineService, ClientDispatchService],
})
export class GameModule {}
