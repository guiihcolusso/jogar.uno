import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator"

import { CardColors } from "../../common/types"

const SELECTABLE_CARD_COLORS: CardColors[] = ["blue", "green", "red", "yellow"]

export class PutCardDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
		cardIds!: string[]

	@IsOptional()
	@IsIn(SELECTABLE_CARD_COLORS)
		selectedColor?: CardColors
}
