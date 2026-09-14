import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { CardColors, CardTypes } from "../../common/types"

const CARD_TYPES: CardTypes[] = [
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
	"block", "buy-2", "reverse", "buy-4", "change-color",
]

const CARD_COLORS: CardColors[] = ["blue", "green", "red", "yellow", "black"]

export class CheatAddCardsDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsOptional()
	@IsString()
		targetPlayerId?: string

	@IsIn(CARD_TYPES)
		cardType!: CardTypes

	@IsIn(CARD_COLORS)
		cardColor!: CardColors

	@IsOptional()
	@IsNumber()
		count?: number
}

export class CheatRemoveCardDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsOptional()
	@IsString()
		targetPlayerId?: string

	@IsString()
	@IsNotEmpty()
		cardId!: string
}

export class CheatSwapCardDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsOptional()
	@IsString()
		targetPlayerId?: string

	@IsString()
	@IsNotEmpty()
		cardId!: string

	@IsIn(CARD_TYPES)
		newCardType!: CardTypes

	@IsIn(CARD_COLORS)
		newCardColor!: CardColors
}

export class CheatSetTopCardDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsIn(CARD_TYPES)
		cardType!: CardTypes

	@IsIn(CARD_COLORS)
		cardColor!: CardColors
}

export class CheatForceTurnDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsOptional()
	@IsString()
		targetPlayerId?: string
}

export class CheatSetHandCountDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsOptional()
	@IsString()
		targetPlayerId?: string

	@IsNumber()
		count!: number
}

export class CheatWinGameDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsOptional()
	@IsString()
		targetPlayerId?: string
}
