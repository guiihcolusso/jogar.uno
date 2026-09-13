import { IsNotEmpty, IsString } from "class-validator"

export class ToggleReadyDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string
}
