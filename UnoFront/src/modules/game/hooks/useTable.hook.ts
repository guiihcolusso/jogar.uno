'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { CardColors, Game, GameStartedEventData, PlayerData, PlayerWonEventData } from '@/shared/socket'
import { useGameSession, useSocket } from '@/shared/socket'

export type UseTableParams = {
  gameId: string
}

type WinState = {
  winnerName: string
  isCurrentPlayer: boolean
  isWaitingForNewGame: boolean
}

function findWinner(game: Game): PlayerData | null {
  if (game.status !== 'ended') return null
  return game.players[game.currentPlayerIndex] ?? null
}

export const useTable = ({ gameId }: UseTableParams) => {
  const session = useGameSession()
  const { on } = useSocket()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [win, setWin] = useState<WinState | null>(null)
  const [pendingCardIds, setPendingCardIds] = useState<string[] | null>(null)
  const [isDropTarget, setIsDropTarget] = useState(false)

  const hasJoinedOnce = useRef(false)

  useEffect(() => {
    let cancelled = false

    const setup = async () => {
      setLoading(true)

      const { game } = await session.joinGame(gameId)
      if (cancelled) return

      hasJoinedOnce.current = true

      if (game.status === 'ended') {
        const winner = findWinner(game)
        const localPlayer = game.players.find((player) => player.id === session.player.id)

        setWin({
          winnerName: winner?.name ?? '',
          isCurrentPlayer: winner?.id === localPlayer?.id,
          isWaitingForNewGame: !localPlayer || localPlayer.ready === true,
        })
      }

      setLoading(false)
    }

    setup()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, session.reconnectCount])

  useEffect(() => {
    return on<GameStartedEventData>('GameStarted', ({ game }) => {
      session.setGameData(game)
      setWin(null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on])

  useEffect(() => {
    return on<PlayerWonEventData>('PlayerWon', ({ player }) => {
      setWin({
        winnerName: player.name,
        isCurrentPlayer: player.id === session.player.id,
        isWaitingForNewGame: false,
      })
    })
     
  }, [on, session.player.id])

  const handlePlayCards = (cardIds: string[]) => {
    const playedCards = session.currentPlayer?.handCards.filter((card) => cardIds.includes(card.id)) ?? []
    const needsColor = playedCards.some((card) => card.type === 'buy-4' || card.type === 'change-color')

    if (needsColor) {
      setPendingCardIds(cardIds)
      return
    }

    session.putCard(gameId, cardIds, '')
  }

  const handleColorSelected = (color: CardColors) => {
    if (pendingCardIds && color) {
      session.putCard(gameId, pendingCardIds, color)
    }

    setPendingCardIds(null)
  }

  const handlePlayAgain = () => {
    session.toggleReady(gameId)
    session.toggleOnlineStatus(gameId)
  }

  const handleQuit = () => {
    setWin(null)
    router.push('/')
  }

  const handleLeaveGame = async () => {
    await session.forceSelfDisconnect(gameId)
    router.push('/')
  }

  const handleBuyCard = () => {
    session.buyCard(gameId)
  }

  const handleGoOnline = () => {
    session.toggleOnlineStatus(gameId)
  }

  const handleSendMessage = (content: string) => {
    if (!session.game?.chatId) return
    session.sendChatMessage(session.game.chatId, content)
  }

  return {
    loading,
    game: session.game,
    player: session.player,
    currentPlayer: session.currentPlayer,
    chat: session.game?.chatId ? (session.chats[session.game.chatId] ?? null) : null,
    gameRoundRemainingTimeInSeconds: session.gameRoundRemainingTimeInSeconds,
    win,
    isColorPickerOpen: pendingCardIds !== null,
    isDropTarget,
    setIsDropTarget,
    handlePlayCards,
    handleColorSelected,
    handlePlayAgain,
    handleQuit,
    handleLeaveGame,
    handleBuyCard,
    handleGoOnline,
    handleSendMessage,
  }
}
