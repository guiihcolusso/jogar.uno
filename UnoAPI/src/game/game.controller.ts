import { Controller, Get } from "@nestjs/common"

import { GameService } from "./game.service"

@Controller("games")
export class GameController {
	constructor (private readonly gameService: GameService) {}

	@Get()
	async getGameList () {
		const games = await this.gameService.getGameList()

		const gameList = games.map(game => ({
			id: game.id,
			title: game.title,
			status: game.status,
			players: game.players.map(player => ({ name: player.name })),
			maxPlayers: game.maxPlayers,
		}))

		return { games: gameList }
	}
}
