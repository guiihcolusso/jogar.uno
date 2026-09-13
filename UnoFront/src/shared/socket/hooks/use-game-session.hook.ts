'use client'

import { useContext, useMemo } from 'react'

import { GameSessionContext, type GameSessionContextValue } from '../providers/game-session.provider'
import type { CardColors, CreateGameEventResponse, Game, JoinGameEventResponse, PlayerData } from '../socket.types'
import { useSocket } from './use-socket.hook'

export type UseGameSessionResult = GameSessionContextValue & {
  currentPlayer: PlayerData | undefined
  currentRoundPlayer: PlayerData | undefined
  winner: PlayerData | null
  createGame: () => Promise<CreateGameEventResponse>
  joinGame: (gameId: string) => Promise<JoinGameEventResponse>
  toggleReady: (gameId: string) => void
  buyCard: (gameId: string) => Promise<void>
  putCard: (gameId: string, cardIds: string[], selectedColor: CardColors) => void
  toggleOnlineStatus: (gameId: string) => Promise<void>
  sendChatMessage: (chatId: string, message: string) => Promise<void>
  forceSelfDisconnect: (gameId: string) => Promise<void>
}

function getWinner(game: Game | null): PlayerData | null {
  if (!game || game.status !== 'ended') return null

  return game.players[game.currentPlayerIndex] ?? null
}

/**
 * Domain-level actions + derived selectors on top of `GameSessionProvider`.
 * Mirrors the old CRA app's `useSocket` hook: optimistic local updates on
 * `toggleReady`/`putCard`/`toggleOnlineStatus` so the UI never waits on a
 * server round-trip to feel instant.
 */
export const useGameSession = (): UseGameSessionResult => {
  const context = useContext(GameSessionContext)
  const { emit } = useSocket()

  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider')
  }

  const { player, game, setGameData } = context

  const currentPlayer = useMemo(() => game?.players.find(({ id }) => id === player.id), [game, player.id])

  const currentRoundPlayer = useMemo(() => game?.players[game.currentPlayerIndex], [game])

  const winner = useMemo(() => getWinner(game), [game])

  const createGame = async () => emit('CreateGame', {})

  const joinGame = async (gameId: string) => {
    const response = await emit('JoinGame', { gameId })
    setGameData(response.game)
    context.setChatData(response.chat)
    return response
  }

  const toggleReady = (gameId: string) => {
    emit('ToggleReady', { gameId })

    if (!game) return

    setGameData({
      ...game,
      players: game.players.map((candidate) =>
        candidate.id === player.id ? { ...candidate, ready: !candidate.ready } : candidate,
      ),
    })
  }

  const buyCard = async (gameId: string) => {
    await emit('BuyCard', { gameId })
  }

  const putCard = (gameId: string, cardIds: string[], selectedColor: CardColors) => {
    emit('PutCard', { gameId, cardIds, selectedColor })

    if (!game) return

    const playedCards = currentPlayer?.handCards.filter((card) => cardIds.includes(card.id)) ?? []

    setGameData({
      ...game,
      usedCards: [...playedCards, ...game.usedCards],
      players: game.players.map((candidate) =>
        candidate.id === player.id
          ? { ...candidate, handCards: candidate.handCards.filter((card) => !cardIds.includes(card.id)) }
          : candidate,
      ),
    })
  }

  const toggleOnlineStatus = async (gameId: string) => {
    await emit('ChangePlayerStatus', { gameId, playerStatus: 'online' })

    if (!game) return

    setGameData({
      ...game,
      players: game.players.map((candidate) =>
        candidate.id === player.id ? { ...candidate, status: 'online' } : candidate,
      ),
    })
  }

  const sendChatMessage = async (chatId: string, message: string) => {
    await emit('SendChatMessage', { chatId, message })
  }

  const forceSelfDisconnect = async (gameId: string) => {
    await emit('ForceSelfDisconnect', { gameId })
  }

  return {
    ...context,
    currentPlayer,
    currentRoundPlayer,
    winner,
    createGame,
    joinGame,
    toggleReady,
    buyCard,
    putCard,
    toggleOnlineStatus,
    sendChatMessage,
    forceSelfDisconnect,
  }
}
