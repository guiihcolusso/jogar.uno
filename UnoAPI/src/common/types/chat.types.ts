export interface ChatMessage {
	id: string
	playerId: string
	playerName: string
	content: string
	date: number
}

export interface Chat {
	id: string
	title: string
	messages: ChatMessage[]
}
