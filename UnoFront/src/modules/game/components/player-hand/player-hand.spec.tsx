import { createRef } from 'react'
import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import gameMessages from '@/modules/game/locales/en/game.json'
import type { CardData, PlayerData } from '@/shared/socket'

import { PlayerHand } from './player-hand.component'

const card = (overrides: Partial<CardData>): CardData => ({
  id: overrides.id ?? 'c1',
  name: overrides.name ?? 'Card',
  src: '/card.svg',
  type: overrides.type ?? '5',
  color: overrides.color ?? 'red',
  canBeUsed: overrides.canBeUsed ?? true,
  canBeCombed: overrides.canBeCombed ?? false,
})

const player = (handCards: CardData[]): PlayerData => ({
  id: 'p1',
  name: 'Ada',
  ready: true,
  status: 'online',
  handCards,
  isCurrentRoundPlayer: true,
  canBuyCard: false,
})

const renderHand = (handCards: CardData[]) => {
  const onPlayCards = jest.fn()
  render(
    <NextIntlClientProvider locale="en" messages={{ game: gameMessages }} timeZone="America/Sao_Paulo">
      <PlayerHand
        player={player(handCards)}
        pileRef={createRef<HTMLDivElement>()}
        onPlayCards={onPlayCards}
        onGoOnline={jest.fn()}
        onDropTargetChange={jest.fn()}
      />
    </NextIntlClientProvider>,
  )
  return { onPlayCards }
}

describe('PlayerHand', () => {
  it('renders the empty state when the hand has no cards', () => {
    renderHand([])
    expect(screen.getByText(gameMessages.hand.empty)).toBeInTheDocument()
  })

  it('selecting a playable card reveals the PLAY action, which plays it', async () => {
    const { onPlayCards } = renderHand([card({ id: 'c1', name: 'Red 5', canBeUsed: true })])
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Red 5' }))
    expect(screen.getByText(`${gameMessages.hand.play} (1)`)).toBeInTheDocument()

    await user.click(screen.getByText(`${gameMessages.hand.play} (1)`))
    expect(onPlayCards).toHaveBeenCalledWith(['c1'])
  })

  it('does not select a card that cannot be used yet', async () => {
    renderHand([card({ id: 'c1', name: 'Blue 9', canBeUsed: false })])
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Blue 9' }))
    expect(screen.queryByText(`${gameMessages.hand.play} (1)`)).not.toBeInTheDocument()
  })

  it('shows the afk banner and lets the player go back online', async () => {
    const onGoOnline = jest.fn()
    render(
      <NextIntlClientProvider locale="en" messages={{ game: gameMessages }} timeZone="America/Sao_Paulo">
        <PlayerHand
          player={{ ...player([]), status: 'afk' }}
          pileRef={createRef<HTMLDivElement>()}
          onPlayCards={jest.fn()}
          onGoOnline={onGoOnline}
          onDropTargetChange={jest.fn()}
        />
      </NextIntlClientProvider>,
    )

    const user = userEvent.setup()
    await user.click(screen.getByText(gameMessages.afk.action))
    expect(onGoOnline).toHaveBeenCalled()
  })
})
