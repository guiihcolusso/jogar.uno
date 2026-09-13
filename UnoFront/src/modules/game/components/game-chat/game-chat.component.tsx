'use client'

import { useEffect, useRef, useState } from 'react'

import { Button, Drawer, Input, useOverlayState } from '@heroui/react'
import { MessageCircle, Send } from 'lucide-react'

import { useLocale } from '@/shared/i18n'

import { styles } from './game-chat.styles'
import type { GameChatParams } from './game-chat.types'

export const GameChat = ({ chat, currentPlayerId, onSendMessage }: GameChatParams) => {
  const { chat: chatLocale } = useLocale('game')
  const state = useOverlayState()
  const [content, setContent] = useState('')
  const [unseenCount, setUnseenCount] = useState(0)
  const lastMessageCount = useRef(0)
  const messagesRef = useRef<HTMLDivElement>(null)

  const messages = chat?.messages ?? []
  const messageCount = messages.length

  useEffect(() => {
    if (messageCount > lastMessageCount.current) {
      if (!state.isOpen) setUnseenCount((count) => count + (messageCount - lastMessageCount.current))
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
    }
    lastMessageCount.current = messageCount
  }, [messageCount, state.isOpen])

  const handleOpen = () => {
    state.open()
    setUnseenCount(0)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim()) return

    onSendMessage(content.trim())
    setContent('')
  }

  if (!chat) return null

  return (
    <>
      <Button isIconOnly variant="ghost" aria-label={chatLocale.trigger} onPress={handleOpen} className={styles.trigger()}>
        <MessageCircle size={18} />
        {unseenCount > 0 && <span className={styles.badge()}>{unseenCount}</span>}
      </Button>

      <Drawer.Root isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>{chatLocale.title}</Drawer.Heading>
              </Drawer.Header>

              <div ref={messagesRef} className={styles.messages()}>
                {messages.map((message) => (
                  <p key={message.id} className={styles.message()}>
                    <span className={styles.messageAuthor()}>
                      {message.playerId === currentPlayerId ? chatLocale.you : message.playerName}:
                    </span>{' '}
                    {message.content}
                  </p>
                ))}
              </div>

              <form className={styles.form()} onSubmit={handleSubmit}>
                <Input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={chatLocale.placeholder}
                  aria-label={chatLocale.placeholder}
                  fullWidth
                />
                <Button type="submit" isIconOnly variant="primary" aria-label={chatLocale.send}>
                  <Send size={16} />
                </Button>
              </form>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer.Root>
    </>
  )
}
