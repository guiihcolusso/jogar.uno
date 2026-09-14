import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { WsException } from "@nestjs/websockets"

import { SocketEmitterService } from "../common/realtime/socket-emitter.service"
import { shuffle } from "../common/utils/array.util"
import { makeShortUUID } from "../common/utils/id.util"
import { getSanitizedValueWithBoundaries } from "../common/utils/number.util"
import {
	CardColors,
	CardData,
	CardTypes,
	Game,
	PlayerData,
	PlayerStatus,
	ServerEvent,
} from "../common/types"
import { PlayerService } from "../player/player.service"
import { CardService } from "./card.service"
import { ClientDispatchService } from "./client-dispatch.service"
import { GameEngineService } from "./game-engine.service"
import { GameRepository } from "./game.repository"
import { GameRoundService } from "./game-round.service"

/**
 * Orchestration layer: persistence (Redis via GameRepository), realtime
 * emission (SocketEmitterService) and round-timer scheduling
 * (GameRoundService) around the pure card-rules engine (GameEngineService).
 * Ported method-for-method from the original single 845-line GameService.
 */
@Injectable()
export class GameService implements OnApplicationBootstrap {
	private readonly logger = new Logger(GameService.name)

	constructor (
		private readonly gameRepository: GameRepository,
		private readonly playerService: PlayerService,
		private readonly cardService: CardService,
		private readonly gameEngine: GameEngineService,
		private readonly gameRoundService: GameRoundService,
		private readonly clientDispatch: ClientDispatchService,
		private readonly socketEmitter: SocketEmitterService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * Re-arms round timers for any game that was mid-round when the process
	 * last stopped. Live setTimeout/setInterval handles can't survive a
	 * restart, so this scans Redis for "playing" games and restarts a fresh
	 * round timer for each (see GameRoundService for the persisted metadata
	 * this relies on).
	 */
	async onApplicationBootstrap (): Promise<void> {
		const games = await this.gameRepository.getGameList()
		const onGoingGames = games.filter(({ status }) => status === "playing")

		await Promise.all(
			onGoingGames.map(async game => {
				this.logger.log(`Re-arming round timer for in-progress game ${game.id}`)

				await this.resetRoundCounter(game.id)
			}),
		)
	}

	async setupGame (playerId: string, chatId: string): Promise<Game> {
		const cards = await this.cardService.setupRandomCards()

		const playerData = await this.playerService.getPlayerData(playerId)

		const isDev = this.configService.get<string>("NODE_ENV") === "development"

		const game: Game = {
			maxPlayers: 8,
			type: "public",
			status: "waiting",
			round: 0,
			id: makeShortUUID(),
			chatId,
			currentPlayerIndex: 0,
			nextPlayerIndex: 1,
			currentGameColor: null,
			title: playerData?.name ?? "",
			availableCards: [],
			usedCards: [],
			players: [],
			cards,
			direction: "clockwise",
			currentCardCombo: {
				cardTypes: [],
				amountToBuy: 0,
			},
			maxRoundDurationInSeconds: isDev ? 100 : 30,
			createdAt: Date.now(),
		}

		await this.setGameData(game.id, game)

		return game
	}

	/**
	 * A "waiting" game whose title literally equals the requesting player's
	 * display name is treated as that player's already-created game -
	 * deliberate dedup-by-title quirk, preserved as-is.
	 */
	async getExistingPlayerGame (playerId: string): Promise<Game | undefined> {
		const player = await this.playerService.getPlayerData(playerId)
		const games = await this.getGameList()

		return games
			.filter(({ status }) => status === "waiting")
			.find(({ title }) => title === player?.name)
	}

	async getGame (gameId: string): Promise<Game | null> {
		return this.gameRepository.getGame(gameId)
	}

	async getGameList (): Promise<Game[]> {
		return this.gameRepository.getGameList()
	}

	async joinGame (gameId: string, playerId: string): Promise<Game> {
		const game = await this.getGame(gameId)

		if (!game) {
			throw new WsException("Game not found")
		}

		const existingPlayer = game.players?.find(player => player.id === playerId)

		const gameHasNotStarted = game.status === "waiting"
		const gameIsNotFull = game.players.length < game.maxPlayers
		const playerIsNotOnGame = !existingPlayer

		if (gameHasNotStarted && gameIsNotFull && playerIsNotOnGame) {
			const playerData = await this.playerService.getPlayerData(playerId)

			const player: PlayerData = {
				id: playerId,
				name: playerData?.name ?? "",
				handCards: [],
				status: "online",
				ready: false,
				isCurrentRoundPlayer: false,
				canBuyCard: false,
			}

			game.players.push(player)

			this.emitGameEvent(game.id, "PlayerJoined", { player })
		}

		const gameRoundRemainingTimeInSeconds = await this.gameRoundService.getRoundRemainingTimeInSeconds(gameId)

		this.gameRoundService.emitGameRoundEvent(gameId, "GameRoundRemainingTimeChanged", {
			roundRemainingTimeInSeconds: gameRoundRemainingTimeInSeconds,
		})

		if (!playerIsNotOnGame) {
			game.players = this.applyPlayerStatusChange(game, playerId, "online")
		}

		await this.setGameData(gameId, game)

		return game
	}

	async purgePlayer (playerId: string): Promise<Game[]> {
		const games = await this.getGameList()

		const purgedGames: Game[] = []

		await Promise.all(
			games.map(async game => {
				const isPlayerOnGame = game?.players?.find(player => player?.id === playerId)

				if (isPlayerOnGame) {
					await this.disconnectPlayer(game.id, playerId)

					this.emitGameEvent(game.id, "PlayerLeft", { playerId })

					purgedGames.push(game)
				}
			}),
		)

		return purgedGames
	}

	async toggleReady (playerId: string, gameId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			throw new WsException("Game not found")
		}

		const updatedPlayer = game.players?.find(({ id }) => id === playerId)

		if (!updatedPlayer) {
			throw new WsException("Player is not part of this game")
		}

		updatedPlayer.ready = !updatedPlayer.ready

		this.emitGameEvent(gameId, "PlayerToggledReady", {
			playerId,
			ready: updatedPlayer.ready,
		})

		await this.setGameData(gameId, game)

		const areAllPlayersReady = game.players?.every(player => player.ready)

		if (areAllPlayersReady) {
			await this.startGame(gameId)
		}
	}

	async buyCard (playerId: string, gameId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			throw new WsException("Game not found")
		}

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)

		if (currentPlayerInfo.id !== playerId) {
			return
		}

		const player = game.players?.find(player => player.id === currentPlayerInfo.id)

		const needToBuyCard = player?.handCards?.every(card => !card.canBeUsed)

		if (!needToBuyCard) {
			return
		}

		/**
		 * Defensive guard (not present in the original): bail out instead of
		 * shifting `undefined` off an empty deck. Recycling normally keeps the
		 * deck fed, so this is a belt-and-braces edge case, not a fix for a
		 * reproduced bug.
		 */
		if (!game.availableCards.length) {
			this.logger.warn(`Game ${gameId}: player ${playerId} tried to buy a card with an empty deck`)

			return
		}

		const available = [...game.availableCards]

		const card = available.shift() as CardData

		this.emitGameEvent(game.id, "PlayerBoughtCard", {
			playerId,
			cards: [card],
		})

		game.players = game.players?.map(player => {
			if (player.id === playerId) {
				return {
					...player,
					handCards: [card, ...player?.handCards],
				}
			}

			return player
		})

		game.availableCards = available

		game.players = this.applyCardUsability(currentPlayerInfo.id, game)

		await this.setGameData(gameId, game)
	}

	/**
	 * The core turn resolver. Supports playing multiple cards at once
	 * (stacking, e.g. two buy-2s in one move).
	 */
	async putCard (playerId: string, cardIds: string[], gameId: string, selectedColor: CardColors | undefined): Promise<void> {
		let game = await this.getGame(gameId)

		if (!game) {
			throw new WsException("Game not found")
		}

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)

		if (currentPlayerInfo.id !== playerId) {
			return
		}

		const player = game.players?.find(player => player.id === playerId)

		const cards: CardData[] = []

		cardIds.forEach(cardId => {
			const card = player?.handCards?.find(card => card.id === cardId)

			if (card) {
				cards.push(card)
			}
		})

		this.emitGameEvent(game.id, "PlayerPutCard", { playerId, cards })

		game.players = game.players?.map(player => {
			if (player.id === playerId) {
				return {
					...player,
					handCards: player?.handCards?.filter(card => !cardIds.includes(card.id)),
				}
			}

			return player
		})

		/**
		 * We keep flowing the used cards back to the draw stack, in order to
		 * help keeping the game up till someone wins it.
		 */
		const usedCards = [...cards, ...game.usedCards]

		const inStackCards = usedCards.slice(0, 10).filter(card => card)
		let outStackCards = usedCards.slice(10, usedCards.length).filter(card => card)

		outStackCards = outStackCards.map(card => {
			if (card.color === "black") {
				return {
					...card,
					selectedColor: null,
					src: card.possibleColors?.black ?? card.src,
				}
			}

			return card
		})

		shuffle(outStackCards)

		game.usedCards = inStackCards
		game.availableCards = [
			...game.availableCards,
			...outStackCards,
		]

		game.currentGameColor = cards[0]?.color as CardColors

		const effectResult = this.gameEngine.buildGameWithCardEffect(game, cards, selectedColor)

		game = effectResult.game

		effectResult.events.forEach(engineEvent => {
			this.emitGameEvent(game.id, engineEvent.event, engineEvent.data)
		})

		await this.setGameData(gameId, game)

		await this.nextRound(gameId)
	}

	async changePlayerStatus (gameId: string, playerId: string, playerStatus: PlayerStatus): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			throw new WsException("Game not found")
		}

		game.players = this.applyPlayerStatusChange(game, playerId, playerStatus)

		await this.setGameData(gameId, game)
	}

	emitGameEvent<Data> (gameId: string, event: ServerEvent, data: Data): void {
		this.socketEmitter.emitToRoom("game", gameId, event, data)

		const gameUpdateEvents: ServerEvent[] = [
			"GameStarted",
			"GameCreated",
			"GameEnded",
			"PlayerJoined",
			"PlayerLeft",
		]

		if (gameUpdateEvents.includes(event)) {
			void this.clientDispatch.dispatchGameHistoryConsolidated()
			void this.clientDispatch.dispatchGameListUpdated()
		}
	}

	private applyCardUsability (currentPlayerId: string, game: Game): PlayerData[] {
		const { players, result } = this.gameEngine.buildPlayersWithCardUsability(currentPlayerId, game)

		this.emitGameEvent(game.id, "PlayerCardUsabilityConsolidated", result.consolidated)

		return players
	}

	private applyPlayerStatusChange (game: Game, playerId: string, status: PlayerStatus): PlayerData[] {
		const updatedPlayer = game.players.find(({ id }) => id === playerId)

		if (!updatedPlayer) {
			return game.players
		}

		updatedPlayer.status = status

		const playersWithChangedPlayerStatus = game.players.map(player => {
			if (player.id === playerId) {
				return updatedPlayer
			}

			return player
		})

		this.emitGameEvent(game.id, "PlayerStatusChanged", {
			playerId: updatedPlayer.id,
			status: updatedPlayer.status,
		})

		return playersWithChangedPlayerStatus
	}

	private async startGame (gameId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			return
		}

		const allCards = [...game.cards]

		const currentPlayer = this.gameEngine.getCurrentPlayerInfo(game)

		game.status = "playing"

		game.players = game.players.map(player => {
			const handCards: CardData[] = []

			for (let i = 0; i < 7; i++) {
				const selectedCard = allCards.shift()

				if (selectedCard) {
					handCards.push(selectedCard)
				}
			}

			return {
				...player,
				isCurrentRoundPlayer: player.id === currentPlayer.id,
				handCards: handCards.map(handCard => ({
					...handCard,
					canBeUsed: player.id === currentPlayer.id,
				})),
				canBuyCard: false,
			}
		})

		game.availableCards = allCards

		await this.setGameData(gameId, game)

		this.emitGameEvent(gameId, "GameStarted", { game })

		await this.resetRoundCounter(gameId)
	}

	private async disconnectPlayer (gameId: string, playerId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			return
		}

		if (game.status === "waiting") {
			game.players = game.players?.filter(player => player.id !== playerId)
		}

		if (game.status === "playing") {
			game.players = this.applyPlayerStatusChange(game, playerId, "offline")
		}

		await this.setGameData(gameId, game)
	}

	private async nextRound (gameId: string): Promise<void> {
		await this.resetRoundCounter(gameId)

		const game = await this.getGame(gameId)

		if (!game) {
			return
		}

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)

		if (currentPlayerInfo.gameStatus === "winner") {
			this.emitGameEvent(gameId, "PlayerWon", {
				player: {
					id: currentPlayerInfo.id,
					name: currentPlayerInfo.name,
				},
			})

			await this.endGame(gameId)

			return
		}

		if (currentPlayerInfo.gameStatus === "uno") {
			this.emitGameEvent(gameId, "PlayerUno", { playerId: currentPlayerInfo.id })
		}

		const expectedNextPlayerIndex = game.nextPlayerIndex

		const nextPlayerIndex = getSanitizedValueWithBoundaries(expectedNextPlayerIndex, game.players.length, 0)

		if (game.direction === "clockwise") {
			game.nextPlayerIndex = nextPlayerIndex + 1
		} else {
			game.nextPlayerIndex = nextPlayerIndex - 1
		}

		const nextPlayer = game.players[nextPlayerIndex]

		game.players = this.applyCardUsability(nextPlayer.id, game)

		game.round++

		game.currentPlayerIndex = nextPlayerIndex

		const nextPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)

		await this.setGameData(gameId, game)

		if (nextPlayerInfo.playerStatus === "afk") {
			await new Promise<void>(resolve => {
				setTimeout(() => {
					this.makeComputedPlay(gameId, nextPlayerInfo.id)
						.catch(error => this.logger.error(`makeComputedPlay failed for game ${gameId}`, error))
						.finally(() => resolve())
				}, 1000)
			})
		}
	}

	private async endGame (gameId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			return
		}

		const winnerInfo = this.gameEngine.getCurrentPlayerInfo(game)

		const cards = await this.cardService.setupRandomCards()

		game.status = "ended"
		game.round = 0

		const winnerIndex = game.players.findIndex(player => player.id === winnerInfo.id)

		game.currentPlayerIndex = winnerIndex
		game.nextPlayerIndex = getSanitizedValueWithBoundaries(game.currentPlayerIndex + 1, game.players.length, 0)

		game.availableCards = []
		game.usedCards = []

		game.currentCardCombo = {
			cardTypes: [],
			amountToBuy: 0,
		}

		game.cards = cards

		game.players = game.players.map(player => ({
			...player,
			canBuyCard: false,
			handCards: [],
			isCurrentRoundPlayer: false,
			ready: false,
			status: "online",
		}))

		await this.setGameData(gameId, game)

		await this.gameRoundService.removeRoundCounter(gameId)

		this.emitGameEvent(gameId, "GameEnded", { gameId })
	}

	/**
	 * Auto-plays for an AFK player: plays the first usable card (random
	 * color choice if needed), or buys then retries. Guarded against an
	 * empty deck, which would otherwise recurse forever.
	 */
	private async makeComputedPlay (gameId: string, playerId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			return
		}

		const player = game.players.find(playerItem => playerItem.id === playerId)

		if (!player || player.status === "online") {
			return
		}

		const { handCards } = player

		const usableCard = handCards.find(card => card.canBeUsed)

		if (!usableCard) {
			if (!game.availableCards.length) {
				this.logger.warn(`Game ${gameId}: AFK auto-play stopped, deck is empty and no card is usable`)

				return
			}

			await this.buyCard(playerId, gameId)

			await this.makeComputedPlay(gameId, playerId)

			return
		}

		const randomCardColor = await this.cardService.retrieveRandomCardColor()

		await this.putCard(playerId, [usableCard.id], gameId, randomCardColor)
	}

	private async resetRoundCounter (gameId: string): Promise<void> {
		const game = await this.getGame(gameId)

		if (!game) {
			return
		}

		const gameRoundRemainingTime = await this.gameRoundService.getRoundRemainingTimeInSeconds(gameId)

		this.gameRoundService.emitGameRoundEvent(gameId, "GameRoundRemainingTimeChanged", {
			roundRemainingTimeInSeconds: gameRoundRemainingTime,
		})

		await this.gameRoundService.resetRoundCounter(gameId, {
			timeInSeconds: game.maxRoundDurationInSeconds,
			timeoutAction: async id => {
				const currentGame = await this.getGame(id)

				if (!currentGame) {
					return
				}

				const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(currentGame)

				currentGame.players = this.applyPlayerStatusChange(currentGame, currentPlayerInfo.id, "afk")

				await this.setGameData(id, currentGame)

				await this.makeComputedPlay(id, currentPlayerInfo.id)
			},
			intervalAction: async id => {
				const remaining = await this.gameRoundService.getRoundRemainingTimeInSeconds(id)

				this.gameRoundService.emitGameRoundEvent(id, "GameRoundRemainingTimeChanged", {
					roundRemainingTimeInSeconds: remaining,
				})
			},
		})
	}

	async cheatAddCards (
		gameId: string,
		playerId: string,
		cardType: CardTypes,
		cardColor: CardColors,
		count = 1,
	): Promise<CardData[]> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		const cards: CardData[] = []
		for (let i = 0; i < count; i++) {
			cards.push(this.cardService.buildCustomCard(cardType, cardColor))
		}

		game.players = game.players?.map(player => {
			if (player.id === playerId) {
				return {
					...player,
					handCards: [...cards, ...(player.handCards || [])],
				}
			}
			return player
		})

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)
		game.players = this.applyCardUsability(currentPlayerInfo.id, game)

		await this.setGameData(gameId, game)

		this.emitGameEvent(game.id, "PlayerBoughtCard", {
			playerId,
			cards,
		})

		return cards
	}

	async cheatRemoveCard (gameId: string, playerId: string, cardId: string): Promise<void> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		game.players = game.players?.map(player => {
			if (player.id === playerId) {
				return {
					...player,
					handCards: player.handCards?.filter(c => c.id !== cardId) || [],
				}
			}
			return player
		})

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)
		game.players = this.applyCardUsability(currentPlayerInfo.id, game)

		await this.setGameData(gameId, game)

		this.emitGameEvent(game.id, "PlayerPutCard", {
			playerId,
			cards: [{ id: cardId } as CardData],
		})
	}

	async cheatSwapCard (
		gameId: string,
		playerId: string,
		cardId: string,
		newCardType: CardTypes,
		newCardColor: CardColors,
	): Promise<CardData> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		const newCard = this.cardService.buildCustomCard(newCardType, newCardColor)

		game.players = game.players?.map(player => {
			if (player.id === playerId) {
				return {
					...player,
					handCards: (player.handCards || []).map(card => card.id === cardId ? newCard : card),
				}
			}
			return player
		})

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)
		game.players = this.applyCardUsability(currentPlayerInfo.id, game)

		await this.setGameData(gameId, game)

		this.emitGameEvent(game.id, "PlayerPutCard", {
			playerId,
			cards: [{ id: cardId } as CardData],
		})
		this.emitGameEvent(game.id, "PlayerBoughtCard", {
			playerId,
			cards: [newCard],
		})

		return newCard
	}

	async cheatSetTopCard (gameId: string, cardType: CardTypes, cardColor: CardColors): Promise<CardData> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		const card = this.cardService.buildCustomCard(cardType, cardColor)
		game.usedCards = [card, ...(game.usedCards || [])]
		game.currentGameColor = cardColor === "black" ? "red" : cardColor

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)
		game.players = this.applyCardUsability(currentPlayerInfo.id, game)

		await this.setGameData(gameId, game)

		this.emitGameEvent(game.id, "PlayerPutCard", {
			playerId: currentPlayerInfo.id,
			cards: [card],
		})

		return card
	}

	async cheatForceTurn (gameId: string, playerId: string): Promise<void> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		const playerIndex = game.players.findIndex(p => p.id === playerId)
		if (playerIndex === -1) return

		game.currentPlayerIndex = playerIndex
		game.nextPlayerIndex = game.direction === "clockwise" ? playerIndex + 1 : playerIndex - 1
		game.players = this.applyCardUsability(playerId, game)

		await this.setGameData(gameId, game)
		await this.resetRoundCounter(gameId)
	}

	async cheatSetHandCount (gameId: string, playerId: string, targetCount: number): Promise<void> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		game.players = game.players?.map(player => {
			if (player.id === playerId) {
				let handCards = [...(player.handCards || [])]
				if (handCards.length > targetCount) {
					handCards = handCards.slice(0, targetCount)
				} else {
					while (handCards.length < targetCount) {
						handCards.push(this.cardService.buildCustomCard("change-color", "black"))
					}
				}
				return { ...player, handCards }
			}
			return player
		})

		const currentPlayerInfo = this.gameEngine.getCurrentPlayerInfo(game)
		game.players = this.applyCardUsability(currentPlayerInfo.id, game)

		await this.setGameData(gameId, game)

		const player = game.players.find(p => p.id === playerId)
		if (player) {
			this.emitGameEvent(game.id, "PlayerBoughtCard", {
				playerId,
				cards: player.handCards,
			})
		}
	}

	async cheatWinGame (gameId: string, playerId: string): Promise<void> {
		const game = await this.getGame(gameId)
		if (!game) throw new WsException("Game not found")

		const player = game.players.find(p => p.id === playerId)
		if (!player) return

		this.emitGameEvent(gameId, "PlayerWon", {
			player: {
				id: player.id,
				name: player.name,
			},
		})

		await this.endGame(gameId)
	}

	private async setGameData (gameId: string, game: Game): Promise<void> {
		await this.gameRepository.setGameData(gameId, game)
	}
}
