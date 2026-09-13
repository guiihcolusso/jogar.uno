'use client'

import { createContext, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { PlayerNameModal } from '../components/player-name-modal'
import { useSocket } from '../hooks/use-socket.hook'
import { playerStorage } from '../player-storage'
import type {
  Chat,
  ChatMessage,
  Game,
  GameAmountToBuyChangedEventData,
  GameHistory,
  GameHistoryConsolidatedEventData,
  GameRoundRemainingTimeChangedEventData,
  NewMessageEventData,
  Player,
  PlayerBoughtCardEventData,
  PlayerCardUsabilityConsolidatedEventData,
  PlayerChoseCardColorEventData,
  PlayerJoinedEventData,
  PlayerLeftEventData,
  PlayerPutCardEventData,
  PlayerStatusChangedEventData,
  PlayerToggledReadyEventData,
} from '../socket.types'

export type GameSessionContextValue = {
  ready: boolean
  player: Player
  game: Game | null
  chats: Record<string, Chat>
  gameHistory: GameHistory[]
  gameRoundRemainingTimeInSeconds: number
  reconnectCount: number
  setGameData: (data: Game) => void
  setChatData: (data: Chat) => void
  addChatMessage: (chatId: string, message: ChatMessage) => void
  changePlayerName: (name: string) => Promise<void>
}

export const GameSessionContext = createContext<GameSessionContextValue | null>(null)

export type GameSessionProviderParams = {
  children: ReactNode
}

/**
 * Domain state that used to live in the CRA app's `store/Socket.tsx`: the
 * current player identity, the active game, chats and the round timer.
 * Mounted once at the app root so it survives navigation between
 * dashboard → room → table.
 */
export const GameSessionProvider = ({ children }: GameSessionProviderParams) => {
  const { emit, on } = useSocket()

  const [player, setPlayer] = useState<Player | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [chats, setChats] = useState<Record<string, Chat>>({})
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [gameRoundRemainingTimeInSeconds, setGameRoundRemainingTimeInSeconds] = useState(0)
  const [reconnectCount, setReconnectCount] = useState(0)

  const hasConnectedBefore = useRef(false)

  const setGameData = useCallback((data: Game) => {
    setGame((lastState) => ({
      ...(lastState || ({} as Game)),
      ...(data || {}),
    }))
  }, [])

  const setChatData = useCallback((data: Chat) => {
    setChats((lastState) => ({ ...lastState, [data.id]: data }))
  }, [])

  const addChatMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats((lastState) => {
      const chat = lastState[chatId]
      if (!chat) return lastState

      const alreadyExists = chat.messages.some((existing) => existing.id === message.id)
      if (alreadyExists) return lastState

      return {
        ...lastState,
        [chatId]: { ...chat, messages: [...chat.messages, message] },
      }
    })
  }, [])

  const registerPlayer = useCallback(
    async (candidate: Player) => {
      const { player: confirmedPlayer } = await emit('SetPlayerData', { player: candidate })

      playerStorage.set(confirmedPlayer)
      setPlayer(confirmedPlayer)

      return confirmedPlayer
    },
    [emit],
  )

  const changePlayerName = useCallback(
    async (name: string) => {
      const candidate = playerStorage.createGuestName(name)
      await registerPlayer(candidate)
    },
    [registerPlayer],
  )

  /* eslint-disable react-hooks/set-state-in-effect --
     setState happens asynchronously after the `SetPlayerData` ack, not
     synchronously during this effect — this is a mount-time hydration, not
     a render-cascade. */
  useEffect(() => {
    const stored = playerStorage.get()
    if (stored) {
      registerPlayer(stored).catch(() => {
        // ack failed (e.g. offline on first paint) — the connect listener below retries
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return on<unknown>('connect', () => {
      if (!hasConnectedBefore.current) {
        hasConnectedBefore.current = true
        return
      }

      const stored = playerStorage.get()
      if (stored) {
        registerPlayer(stored).catch(() => {})
      }

      setReconnectCount((count) => count + 1)
    })
  }, [on, registerPlayer])

  useEffect(() => {
    const unsubscribers = [
      on<GameRoundRemainingTimeChangedEventData>('GameRoundRemainingTimeChanged', ({ roundRemainingTimeInSeconds }) => {
        setGameRoundRemainingTimeInSeconds(roundRemainingTimeInSeconds)
      }),

      on<GameHistoryConsolidatedEventData>('GameHistoryConsolidated', ({ gameHistory: nextGameHistory }) => {
        setGameHistory(nextGameHistory)
      }),

      on<PlayerJoinedEventData>('PlayerJoined', ({ player: joinedPlayer }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          const alreadyExists = lastState.players.some(({ id }) => id === joinedPlayer.id)
          if (alreadyExists) return lastState

          return { ...lastState, players: [...lastState.players, joinedPlayer] }
        })
      }),

      on<PlayerLeftEventData>('PlayerLeft', ({ playerId }) => {
        setGame((lastState) => {
          if (!lastState?.id || lastState.status !== 'waiting') return lastState

          return { ...lastState, players: lastState.players.filter(({ id }) => id !== playerId) }
        })
      }),

      on<PlayerToggledReadyEventData>('PlayerToggledReady', ({ playerId, ready }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          return {
            ...lastState,
            players: lastState.players.map((candidate) =>
              candidate.id === playerId ? { ...candidate, ready } : candidate,
            ),
          }
        })
      }),

      on<PlayerPutCardEventData>('PlayerPutCard', ({ playerId, cards }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          const usedCards = [...lastState.usedCards]
          ;[...cards].reverse().forEach((card) => {
            if (!usedCards.some(({ id }) => id === card.id)) usedCards.unshift(card)
          })

          return {
            ...lastState,
            usedCards,
            players: lastState.players.map((candidate) =>
              candidate.id === playerId
                ? {
                    ...candidate,
                    handCards: candidate.handCards.filter(
                      (handCard) => !cards.some(({ id }) => id === handCard.id),
                    ),
                  }
                : candidate,
            ),
          }
        })
      }),

      on<PlayerChoseCardColorEventData>('PlayerChoseCardColor', ({ cards }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          return {
            ...lastState,
            usedCards: lastState.usedCards.map(
              (usedCard) => cards.find(({ id }) => id === usedCard.id) ?? usedCard,
            ),
          }
        })
      }),

      on<PlayerBoughtCardEventData>('PlayerBoughtCard', ({ playerId, cards }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          return {
            ...lastState,
            players: lastState.players.map((candidate) => {
              if (candidate.id !== playerId) return candidate

              const newCards = cards.filter((card) => !candidate.handCards.some(({ id }) => id === card.id))

              return { ...candidate, handCards: [...newCards, ...candidate.handCards] }
            }),
          }
        })
      }),

      on<PlayerCardUsabilityConsolidatedEventData>('PlayerCardUsabilityConsolidated', ({ players }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          return {
            ...lastState,
            players: lastState.players.map((candidate) => {
              const consolidated = players.find(({ id }) => id === candidate.id)
              if (!consolidated) return candidate

              return {
                ...candidate,
                isCurrentRoundPlayer: consolidated.isCurrentRoundPlayer,
                canBuyCard: consolidated.canBuyCard,
                handCards: candidate.handCards.map((handCard) => {
                  const consolidatedCard = consolidated.handCards.find(({ id }) => id === handCard.id)
                  if (!consolidatedCard) return handCard

                  return {
                    ...handCard,
                    canBeUsed: consolidatedCard.canBeUsed,
                    canBeCombed: consolidatedCard.canBeCombed,
                  }
                }),
              }
            }),
          }
        })
      }),

      on<PlayerStatusChangedEventData>('PlayerStatusChanged', ({ playerId, status }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          return {
            ...lastState,
            players: lastState.players.map((candidate) =>
              candidate.id === playerId ? { ...candidate, status } : candidate,
            ),
          }
        })
      }),

      on<GameAmountToBuyChangedEventData>('GameAmountToBuyChanged', ({ amountToBuy }) => {
        setGame((lastState) => {
          if (!lastState?.id) return lastState

          return { ...lastState, currentCardCombo: { ...lastState.currentCardCombo, amountToBuy } }
        })
      }),

      on<NewMessageEventData>('NewMessage', ({ chatId, message }) => {
        addChatMessage(chatId, message)
      }),
    ]

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [on, addChatMessage])

  return (
    <GameSessionContext.Provider
      value={{
        ready: !!player,
        player: player ?? { id: '', name: '' },
        game,
        chats,
        gameHistory,
        gameRoundRemainingTimeInSeconds,
        reconnectCount,
        setGameData,
        setChatData,
        addChatMessage,
        changePlayerName,
      }}
    >
      {player ? children : <PlayerNameModal onSubmit={changePlayerName} />}
    </GameSessionContext.Provider>
  )
}
