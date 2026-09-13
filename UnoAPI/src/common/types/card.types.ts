export type CardColors = "blue" | "green" | "red" | "yellow" | "black"

export type CardTypes =
	| "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
	| "block"
	| "buy-2"
	| "reverse"
	| "buy-4"
	| "change-color"

export type CardPossibleColors = Partial<Record<CardColors, string>>

export interface CardData {
	id: string
	src: string
	name: string
	color: CardColors
	type: CardTypes
	/**
	 * Only present on wild cards ("buy-4" / "change-color"). Holds the color
	 * the player picked when playing the card, and the map of art per color
	 * so the client can render the color picker / re-render the chosen art.
	 */
	selectedColor?: CardColors | null
	possibleColors?: CardPossibleColors
	/**
	 * Only ever populated for the active player's own hand - see
	 * GameEngineService.buildPlayersWithCardUsability for the privacy boundary.
	 */
	canBeUsed?: boolean
	canBeCombed?: boolean
}
