import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import dashboardMessages from '@/modules/dashboard/locales/en/dashboard.json'
import type { Game } from '@/shared/socket'

import { GameCard } from './game-card.component'

const baseGame: Game = {
  id: 'game-1',
  title: 'Friday Night',
  status: 'waiting',
  maxPlayers: 4,
  maxRoundDurationInSeconds: 30,
  currentPlayerIndex: 0,
  players: [{ id: 'p1', name: 'Ada', ready: false, status: 'online', handCards: [], isCurrentRoundPlayer: false, canBuyCard: false }],
  usedCards: [],
  currentCardCombo: { amountToBuy: 0 },
  chatId: 'chat-1',
  createdAt: Date.now(),
}

const renderCard = (game: Game, onOpen = jest.fn()) => {
  render(
    <NextIntlClientProvider locale="en" messages={{ dashboard: dashboardMessages }} timeZone="America/Sao_Paulo">
      <GameCard game={game} onOpen={onOpen} />
    </NextIntlClientProvider>,
  )
  return onOpen
}

describe('GameCard', () => {
  it('renders the title, id and remaining slots', () => {
    renderCard(baseGame)
    expect(screen.getByText('Friday Night')).toBeInTheDocument()
    expect(screen.getByText('#game-1')).toBeInTheDocument()
    expect(screen.getByText(/3 SLOTS LEFT/)).toBeInTheDocument()
  })

  it('calls onOpen with the game id when the action button is pressed', async () => {
    const onOpen = renderCard(baseGame)
    const user = userEvent.setup()

    await user.click(screen.getByText(dashboardMessages.gameCard.actions.join))

    expect(onOpen).toHaveBeenCalledWith('game-1')
  })

  it('disables the action for ended games', () => {
    renderCard({ ...baseGame, status: 'ended' })
    expect(screen.getByText(dashboardMessages.gameCard.actions.ended).closest('button')).toBeDisabled()
  })
})
