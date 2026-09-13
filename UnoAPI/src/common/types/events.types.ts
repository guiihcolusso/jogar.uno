import { CardData, CardColors } from "./card.types"
import { ChatMessage } from "./chat.types"
import { Game } from "./game.types"
import { GameHistory } from "./game-history.types"
import { ConsolidatedPlayer, PlayerData, PlayerStatus } from "./player.types"

/**
 * Every event the server ever broadcasts to a room (game:<id>, player:<id>,
 * chat:<id>) or to everyone. This is the full server -> client contract.
 */
export type ServerEvent =
	| "PlayerJoined"
	| "PlayerLeft"
	| "PlayerToggledReady"
	| "PlayerBoughtCard"
	| "PlayerPutCard"
	| "PlayerChoseCardColor"
	| "PlayerBlocked"
	| "GameAmountToBuyChanged"
	| "PlayerBuyCards"
	| "PlayerStatusChanged"
	| "GameStarted"
	| "GameCreated"
	| "PlayerWon"
	| "PlayerUno"
	| "GameEnded"
	| "GameRoundRemainingTimeChanged"
	| "PlayerCardUsabilityConsolidated"
	| "NewMessage"
	| "GameHistoryConsolidated"
	| "GameListUpdated"

export interface PlayerJoinedEventData {
	player: PlayerData
}

export interface PlayerLeftEventData {
	playerId: string
}

export interface PlayerToggledReadyEventData {
	playerId: string
	ready: boolean
}

export interface PlayerBoughtCardEventData {
	playerId: string
	cards: CardData[]
}

export interface PlayerPutCardEventData {
	playerId: string
	cards: CardData[]
}

export interface PlayerChoseCardColorEventData {
	cards: CardData[]
}

export interface PlayerBlockedEventData {
	playerId: string
}

export interface GameAmountToBuyChangedEventData {
	amountToBuy: number
}

export interface PlayerBuyCardsEventData {
	playerId: string
	amountToBuy: number
}

export interface PlayerStatusChangedEventData {
	playerId: string
	status: PlayerStatus
}

export interface GameStartedEventData {
	game: Game
}

export interface PlayerWonEventData {
	player: {
		id: string
		name: string
	}
}

export interface PlayerUnoEventData {
	playerId: string
}

export interface GameEndedEventData {
	gameId: string
}

export interface GameRoundRemainingTimeChangedEventData {
	roundRemainingTimeInSeconds: number
}

export interface PlayerCardUsabilityConsolidatedEventData {
	players: ConsolidatedPlayer[]
}

export interface NewMessageEventData {
	chatId: string
	message: ChatMessage
}

export interface GameHistoryConsolidatedEventData {
	gameHistory: GameHistory[]
}

export type GameListUpdatedEventData = Record<string, never>
