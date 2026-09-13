import type { Chat } from '@/shared/socket'

export type GameChatParams = {
  chat: Chat | null
  currentPlayerId: string
  onSendMessage: (content: string) => void
}
