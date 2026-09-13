import { Type } from "class-transformer"
import { IsOptional, IsString, MinLength, ValidateNested } from "class-validator"

export class PlayerDto {
	@IsOptional()
	@IsString()
		id?: string

	@IsString()
	@MinLength(1)
		name!: string
}

export class SetPlayerDataDto {
	@ValidateNested()
	@Type(() => PlayerDto)
		player!: PlayerDto
}
