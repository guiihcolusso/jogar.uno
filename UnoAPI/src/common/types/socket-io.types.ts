import { CardColors } from "./card.types"
import { Chat } from "./chat.types"
import { Game } from "./game.types"
import { Player, PlayerInput, PlayerStatus } from "./player.types"

/**
 * Client -> Server request/ack contract.
 */
export interface SetPlayerDataEventInput {
	player: PlayerInput
}

export interface SetPlayerDataEventResponse {
	player: Player
}

export interface CreateGameEventResponse {
	gameId: string
}

export interface JoinGameEventInput {
	gameId: string
}

export interface JoinGameEventResponse {
	game: Game
	chat: Chat
}

export interface BuyCardEventInput {
	gameId: string
}

export interface PutCardEventInput {
	gameId: string
	cardIds: string[]
	selectedColor: CardColors
}

export interface SendChatMessageEventInput {
	chatId: string
	message: string
}

export interface ChangePlayerStatusEventInput {
	gameId: string
	playerStatus: PlayerStatus
}

export interface ToggleReadyEventInput {
	gameId: string
}
