import { Inject, Injectable } from "@nestjs/common"
import Redis from "ioredis"

import { IOREDIS_CLIENT } from "../redis/redis.constants"
import { RedisJsonStore } from "../redis/redis-json-store"
import { Chat, ChatMessage } from "../common/types"

@Injectable()
export class ChatRepository {
	private readonly store: RedisJsonStore<Chat>

	constructor (@Inject(IOREDIS_CLIENT) redis: Redis) {
		this.store = new RedisJsonStore<Chat>(redis, "chat")
	}

	async createChat (chatData: Chat): Promise<void> {
		await this.store.set(chatData.id, chatData)
	}

	async getChat (chatId: string): Promise<Chat | null> {
		return this.store.getOne(chatId)
	}

	async pushMessageToChat (chatId: string, message: ChatMessage): Promise<void> {
		const chat = await this.store.getOne(chatId)

		if (chat) {
			chat.messages.push(message)

			await this.store.set(chatId, chat)
		}
	}
}
