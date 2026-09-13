'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { GameStartedEventData } from '@/shared/socket'
import { useGameSession, useSocket } from '@/shared/socket'

export type UseRoomParams = {
  gameId: string
}

/**
 * Lobby lifecycle: join on mount, redirect to the table once the game
 * starts (either because the join ack already reports `playing`, or a
 * live `GameStarted` broadcast arrives while waiting), and resubscribe
 * after a reconnect.
 */
export const useRoom = ({ gameId }: UseRoomParams) => {
  const { game, currentPlayer, reconnectCount, setGameData, toggleReady } = useGameSession()
  const { on } = useSocket()
  const { joinGame } = useGameSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const setup = async () => {
      setLoading(true)

      const { game: joinedGame } = await joinGame(gameId)

      if (cancelled) return

      if (joinedGame.status === 'playing') {
        router.replace(`/${gameId}/table`)
        return
      }

      setLoading(false)
    }

    setup()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, reconnectCount])

  useEffect(() => {
    return on<GameStartedEventData>('GameStarted', ({ game: startedGame }) => {
      setGameData(startedGame)
      router.replace(`/${gameId}/table`)
    })
  }, [on, gameId, router, setGameData])

  return {
    loading,
    game,
    currentPlayer,
    toggleReady: () => toggleReady(gameId),
  }
}
