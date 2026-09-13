import { IsIn, IsNotEmpty, IsString } from "class-validator"

import { PlayerStatus } from "../../common/types"

const PLAYER_STATUSES: PlayerStatus[] = ["online", "offline", "afk"]

export class ChangePlayerStatusDto {
	@IsString()
	@IsNotEmpty()
		gameId!: string

	@IsIn(PLAYER_STATUSES)
		playerStatus!: PlayerStatus
}
