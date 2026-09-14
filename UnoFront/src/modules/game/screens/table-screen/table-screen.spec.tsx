import { NextIntlClientProvider } from 'next-intl'

import { render, screen, within } from '@testing-library/react'

import gameMessages from '@/modules/game/locales/en/game.json'
import type { Game, PlayerData } from '@/shared/socket'

import { TableScreen } from './table-screen.screen'

const useTableMock = jest.fn()

jest.mock('../../hooks', () => ({
  useTable: (params: unknown) => useTableMock(params),
}))

jest.mock('@/shared/socket', () => ({
  ...jest.requireActual('@/shared/socket'),
  useSocket: () => ({ on: jest.fn(() => jest.fn()), emit: jest.fn() }),
  useGameSession: () => ({ currentPlayer: null, game: null, setGameData: jest.fn() }),
}))

const buildPlayer = (overrides: Partial<PlayerData>): PlayerData => ({
  id: 'p1',
  name: 'Ada',
  ready: true,
  status: 'online',
  handCards: [],
  isCurrentRoundPlayer: true,
  canBuyCard: false,
  ...overrides,
})

const buildGame = (players: PlayerData[]): Game => ({
  id: 'game-1',
  title: 'Table 1',
  status: 'playing',
  maxPlayers: 4,
  maxRoundDurationInSeconds: 30,
  currentPlayerIndex: 0,
  players,
  usedCards: [],
  currentCardCombo: { amountToBuy: 0 },
  chatId: 'chat-1',
  createdAt: Date.now(),
})

const renderScreen = () =>
  render(
    <NextIntlClientProvider locale="en" messages={{ game: gameMessages }} timeZone="America/Sao_Paulo">
      <TableScreen gameId="game-1" />
    </NextIntlClientProvider>,
  )

describe('TableScreen', () => {
  it('shows a spinner while loading', () => {
    useTableMock.mockReturnValue({ loading: true, game: null })
    renderScreen()
    expect(screen.getByTestId('Spinner')).toBeInTheDocument()
  })

  it('renders the table, the local hand and opponents once loaded', () => {
    const localPlayer = buildPlayer({ id: 'p1', name: 'Ada' })
    const opponent = buildPlayer({ id: 'p2', name: 'Bo', isCurrentRoundPlayer: false })
    const game = buildGame([localPlayer, opponent])

    useTableMock.mockReturnValue({
      loading: false,
      game,
      currentPlayer: localPlayer,
      chat: null,
      gameRoundRemainingTimeInSeconds: 20,
      win: null,
      isColorPickerOpen: false,
      isDropTarget: false,
      setIsDropTarget: jest.fn(),
      handlePlayCards: jest.fn(),
      handleColorSelected: jest.fn(),
      handlePlayAgain: jest.fn(),
      handleQuit: jest.fn(),
      handleLeaveGame: jest.fn(),
      handleBuyCard: jest.fn(),
      handleGoOnline: jest.fn(),
      handleSendMessage: jest.fn(),
    })

    renderScreen()

    expect(screen.getByTestId('discard-pile')).toBeInTheDocument()
    expect(screen.getByTestId('player-hand')).toBeInTheDocument()
    expect(screen.getByTestId('player-seat-top')).toBeInTheDocument()
  })

  it('renders the win screen modal when the game has a winner', () => {
    const localPlayer = buildPlayer({ id: 'p1', name: 'Ada' })
    const game = buildGame([localPlayer])

    useTableMock.mockReturnValue({
      loading: false,
      game,
      currentPlayer: localPlayer,
      chat: null,
      gameRoundRemainingTimeInSeconds: 0,
      win: { winnerName: 'Ada', isCurrentPlayer: true, isWaitingForNewGame: false },
      isColorPickerOpen: false,
      isDropTarget: false,
      setIsDropTarget: jest.fn(),
      handlePlayCards: jest.fn(),
      handleColorSelected: jest.fn(),
      handlePlayAgain: jest.fn(),
      handleQuit: jest.fn(),
      handleLeaveGame: jest.fn(),
      handleBuyCard: jest.fn(),
      handleGoOnline: jest.fn(),
      handleSendMessage: jest.fn(),
    })

    renderScreen()

    const winModal = within(screen.getByTestId('win-screen-modal'))
    expect(winModal.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText(gameMessages.winScreen.playAgain)).toBeInTheDocument()
  })
})
