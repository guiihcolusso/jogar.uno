import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class SendChatMessageDto {
	@IsString()
	@IsNotEmpty()
		chatId!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
		message!: string
}
