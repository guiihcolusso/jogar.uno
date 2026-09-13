import { IsNotEmpty, IsString } from "class-validator"

export class BuyCardDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string
}
