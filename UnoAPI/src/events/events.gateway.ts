import { Logger, UsePipes, ValidationPipe } from "@nestjs/common"
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"

import { buildRoomName } from "../common/realtime/room.util"
import { SocketEmitterService } from "../common/realtime/socket-emitter.service"
import {
	CardData,
	CreateGameEventResponse,
	JoinGameEventResponse,
	SetPlayerDataEventResponse,
} from "../common/types"
import { ChatService } from "../chat/chat.service"
import { SendChatMessageDto } from "../chat/dto/send-chat-message.dto"
import { PlayerService } from "../player/player.service"
import { SetPlayerDataDto } from "../player/dto/player.dto"
import { ClientDispatchService } from "../game/client-dispatch.service"
import { GameService } from "../game/game.service"
import { BuyCardDto } from "../game/dto/buy-card.dto"
import { ChangePlayerStatusDto } from "../game/dto/change-player-status.dto"
import { JoinGameDto } from "../game/dto/join-game.dto"
import { PutCardDto } from "../game/dto/put-card.dto"
import { ToggleReadyDto } from "../game/dto/toggle-ready.dto"
import {
	CheatAddCardsDto,
	CheatForceTurnDto,
	CheatRemoveCardDto,
	CheatSetHandCountDto,
	CheatSetTopCardDto,
	CheatSwapCardDto,
	CheatWinGameDto,
} from "../game/dto/cheat.dto"

/**
 * Single connection handler for the whole app, mirroring the old
 * EventHandlerModule.onConnection: one socket carries player/game/chat
 * concerns together, dispatching into the per-domain services.
 *
 * Player identity is a client-supplied UUID/display name, trusted at face
 * value - there is no authentication layer (explicit product decision, this
 * is a guest-only game).
 */
@WebSocketGateway({
	cors: {
		origin: true,
	},
})
@UsePipes(new ValidationPipe({
	transform: true,
	whitelist: true,
	exceptionFactory: errors => new WsException(errors),
}))
export class EventsGateway implements OnGatewayInit, OnGatewayDisconnect {
	private readonly logger = new Logger(EventsGateway.name)

	@WebSocketServer()
	private server!: Server

	/**
	 * Per-connection player identity. A class-based Nest gateway is a
	 * singleton shared by every socket, so (unlike the old per-connection
	 * closure in EventHandlerModule) we key this by socket id.
	 */
	private readonly socketPlayerMap = new Map<string, string>()

	constructor (
		private readonly socketEmitter: SocketEmitterService,
		private readonly playerService: PlayerService,
		private readonly gameService: GameService,
		private readonly chatService: ChatService,
		private readonly clientDispatch: ClientDispatchService,
	) {}

	afterInit (server: Server): void {
		this.socketEmitter.setServer(server)
	}

	async handleDisconnect (client: Socket): Promise<void> {
		const playerId = this.socketPlayerMap.get(client.id)

		this.socketPlayerMap.delete(client.id)

		if (!playerId) {
			return
		}

		await this.gameService.purgePlayer(playerId)
	}

	@SubscribeMessage("SetPlayerData")
	async handleSetPlayerData (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: SetPlayerDataDto,
	): Promise<SetPlayerDataEventResponse> {
		const player = await this.playerService.setPlayerData(dto.player)

		this.socketPlayerMap.set(client.id, player.id)

		client.join(buildRoomName("player", player.id))

		await this.clientDispatch.dispatchGameHistoryConsolidated(player.id)

		return { player }
	}

	@SubscribeMessage("CreateGame")
	async handleCreateGame (@ConnectedSocket() client: Socket): Promise<CreateGameEventResponse> {
		const playerId = this.requirePlayerId(client)

		/**
		 * Prevent players from creating a lot of games - reuse an existing
		 * "waiting" game with the same title-as-player-name if one exists.
		 */
		let game = await this.gameService.getExistingPlayerGame(playerId)

		if (!game) {
			const chat = await this.chatService.setupChat(playerId)

			game = await this.gameService.setupGame(playerId, chat.id)
		}

		client.join(buildRoomName("game", game.id))
		client.join(buildRoomName("chat", game.chatId))

		return { gameId: game.id }
	}

	@SubscribeMessage("JoinGame")
	async handleJoinGame (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: JoinGameDto,
	): Promise<JoinGameEventResponse> {
		const playerId = this.requirePlayerId(client)

		const game = await this.gameService.joinGame(dto.gameId, playerId)
		const chat = await this.chatService.joinChat(game.chatId)

		if (!chat) {
			throw new WsException("Chat not found for this game")
		}

		client.join(buildRoomName("chat", game.chatId))
		client.join(buildRoomName("game", dto.gameId))

		return { game, chat }
	}

	@SubscribeMessage("BuyCard")
	async handleBuyCard (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: BuyCardDto,
	): Promise<void> {
		const playerId = this.requirePlayerId(client)

		await this.gameService.buyCard(playerId, dto.gameId)
	}

	@SubscribeMessage("PutCard")
	async handlePutCard (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: PutCardDto,
	): Promise<void> {
		const playerId = this.requirePlayerId(client)

		await this.gameService.putCard(playerId, dto.cardIds, dto.gameId, dto.selectedColor)
	}

	@SubscribeMessage("SendChatMessage")
	async handleSendChatMessage (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: SendChatMessageDto,
	): Promise<void> {
		const playerId = this.requirePlayerId(client)

		await this.chatService.pushMessage(playerId, dto.chatId, dto.message)
	}

	@SubscribeMessage("ChangePlayerStatus")
	async handleChangePlayerStatus (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: ChangePlayerStatusDto,
	): Promise<void> {
		const playerId = this.requirePlayerId(client)

		await this.gameService.changePlayerStatus(dto.gameId, playerId, dto.playerStatus)
	}

	@SubscribeMessage("ToggleReady")
	async handleToggleReady (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: ToggleReadyDto,
	): Promise<void> {
		const playerId = this.requirePlayerId(client)

		await this.gameService.toggleReady(playerId, dto.gameId)
	}

	@SubscribeMessage("ForceSelfDisconnect")
	async handleForceSelfDisconnect (@ConnectedSocket() client: Socket): Promise<void> {
		const playerId = this.socketPlayerMap.get(client.id)

		if (!playerId) {
			return
		}

		const purgedGames = await this.gameService.purgePlayer(playerId)

		purgedGames.forEach(game => {
			client.leave(buildRoomName("game", game.id))
			client.leave(buildRoomName("chat", game.chatId))
		})
	}

	@SubscribeMessage("CheatAddCards")
	async handleCheatAddCards (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatAddCardsDto,
	): Promise<{ success: boolean; cards: CardData[] }> {
		const callerId = this.requirePlayerId(client)
		const targetPlayerId = dto.targetPlayerId || callerId
		const cards = await this.gameService.cheatAddCards(dto.gameId, targetPlayerId, dto.cardType, dto.cardColor, dto.count || 1)

		return { success: true, cards }
	}

	@SubscribeMessage("CheatRemoveCard")
	async handleCheatRemoveCard (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatRemoveCardDto,
	): Promise<{ success: boolean }> {
		const callerId = this.requirePlayerId(client)
		const targetPlayerId = dto.targetPlayerId || callerId
		await this.gameService.cheatRemoveCard(dto.gameId, targetPlayerId, dto.cardId)

		return { success: true }
	}

	@SubscribeMessage("CheatSwapCard")
	async handleCheatSwapCard (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatSwapCardDto,
	): Promise<{ success: boolean; card: CardData }> {
		const callerId = this.requirePlayerId(client)
		const targetPlayerId = dto.targetPlayerId || callerId
		const card = await this.gameService.cheatSwapCard(
			dto.gameId,
			targetPlayerId,
			dto.cardId,
			dto.newCardType,
			dto.newCardColor,
		)

		return { success: true, card }
	}

	@SubscribeMessage("CheatSetTopCard")
	async handleCheatSetTopCard (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatSetTopCardDto,
	): Promise<{ success: boolean; card: CardData }> {
		this.requirePlayerId(client)
		const card = await this.gameService.cheatSetTopCard(dto.gameId, dto.cardType, dto.cardColor)

		return { success: true, card }
	}

	@SubscribeMessage("CheatForceTurn")
	async handleCheatForceTurn (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatForceTurnDto,
	): Promise<{ success: boolean }> {
		const callerId = this.requirePlayerId(client)
		const targetPlayerId = dto.targetPlayerId || callerId
		await this.gameService.cheatForceTurn(dto.gameId, targetPlayerId)

		return { success: true }
	}

	@SubscribeMessage("CheatSetHandCount")
	async handleCheatSetHandCount (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatSetHandCountDto,
	): Promise<{ success: boolean }> {
		const callerId = this.requirePlayerId(client)
		const targetPlayerId = dto.targetPlayerId || callerId
		await this.gameService.cheatSetHandCount(dto.gameId, targetPlayerId, dto.count)

		return { success: true }
	}

	@SubscribeMessage("CheatWinGame")
	async handleCheatWinGame (
		@ConnectedSocket() client: Socket,
			@MessageBody() dto: CheatWinGameDto,
	): Promise<{ success: boolean }> {
		const callerId = this.requirePlayerId(client)
		const targetPlayerId = dto.targetPlayerId || callerId
		await this.gameService.cheatWinGame(dto.gameId, targetPlayerId)

		return { success: true }
	}

	private requirePlayerId (client: Socket): string {
		const playerId = this.socketPlayerMap.get(client.id)

		if (!playerId) {
			throw new WsException("Player data not set - emit SetPlayerData first")
		}

		return playerId
	}
}
