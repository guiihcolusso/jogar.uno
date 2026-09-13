import { CardData, CardColors, CardTypes } from "./card.types"
import { PlayerData } from "./player.types"

export type GameStatus = "waiting" | "playing" | "ended"

export type GameType = "public"

export type GameDirection = "clockwise" | "counterclockwise"

export interface GameCardCombo {
	cardTypes: CardTypes[]
	amountToBuy: number
}

export interface Game {
	id: string
	chatId: string
	title: string
	type: GameType
	status: GameStatus
	maxPlayers: number
	round: number
	currentPlayerIndex: number
	nextPlayerIndex: number
	currentGameColor: CardColors | null
	availableCards: CardData[]
	usedCards: CardData[]
	cards: CardData[]
	players: PlayerData[]
	direction: GameDirection
	currentCardCombo: GameCardCombo
	maxRoundDurationInSeconds: number
	createdAt: number
}
