import { Injectable } from "@nestjs/common"

import { SocketEmitterService } from "../common/realtime/socket-emitter.service"
import { makeShortUUID, makeUUID } from "../common/utils/id.util"
import { Chat, ChatMessage, NewMessageEventData } from "../common/types"
import { PlayerService } from "../player/player.service"
import { ChatRepository } from "./chat.repository"

@Injectable()
export class ChatService {
	constructor (
		private readonly chatRepository: ChatRepository,
		private readonly playerService: PlayerService,
		private readonly socketEmitter: SocketEmitterService,
	) {}

	async setupChat (playerId: string): Promise<Chat> {
		const playerData = await this.playerService.getPlayerData(playerId)

		const chat: Chat = {
			id: makeShortUUID(),
			title: playerData?.name ?? "",
			messages: [],
		}

		await this.chatRepository.createChat(chat)

		return chat
	}

	async chatExists (chatId: string): Promise<boolean> {
		const chat = await this.chatRepository.getChat(chatId)

		return Boolean(chat)
	}

	async pushMessage (playerId: string, chatId: string, content: string): Promise<void> {
		const playerData = await this.playerService.getPlayerData(playerId)

		const message: ChatMessage = {
			id: makeUUID(),
			playerId,
			playerName: playerData?.name ?? "",
			content,
			date: Date.now(),
		}

		await this.chatRepository.pushMessageToChat(chatId, message)

		this.socketEmitter.emitToRoom<NewMessageEventData>("chat", chatId, "NewMessage", {
			chatId,
			message,
		})
	}

	async joinChat (chatId: string): Promise<Chat | null> {
		return this.chatRepository.getChat(chatId)
	}
}
