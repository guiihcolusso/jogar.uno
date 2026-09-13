import { CardData } from "./card.types"

export type PlayerStatus = "online" | "offline" | "afk"

export interface Player {
	id: string
	name: string
}

/**
 * SetPlayerData's input shape - id is optional (assigned server-side via
 * makeUUID() when missing, e.g. on a brand new client).
 */
export interface PlayerInput {
	id?: string
	name: string
}

export interface PlayerData extends Player {
	handCards: CardData[]
	status: PlayerStatus
	ready: boolean
	isCurrentRoundPlayer: boolean
	canBuyCard: boolean
}

export type CurrentPlayerGameStatus = "winner" | "uno" | undefined

export interface CurrentPlayerInfo {
	id: string
	name: string
	playerStatus: PlayerStatus
	gameStatus: CurrentPlayerGameStatus
}

/**
 * The shape ever emitted for players other than the current active one -
 * hand contents must never leak, only per-card usability flags.
 */
export interface ConsolidatedPlayerCard {
	id: string
	canBeUsed: boolean
	canBeCombed: boolean
}

export interface ConsolidatedPlayer {
	id: string
	isCurrentRoundPlayer: boolean
	canBuyCard: boolean
	handCards: ConsolidatedPlayerCard[]
}
