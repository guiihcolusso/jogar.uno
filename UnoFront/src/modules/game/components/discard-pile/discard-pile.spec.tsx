import { createRef } from 'react'
import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import gameMessages from '@/modules/game/locales/en/game.json'
import type { CardData } from '@/shared/socket'

import { DiscardPile } from './discard-pile.component'

const card = (overrides: Partial<CardData> = {}): CardData => ({
  id: 'c1',
  name: 'Red 5',
  src: '/red-5.svg',
  type: '5',
  color: 'red',
  ...overrides,
})

const renderPile = (props: Partial<React.ComponentProps<typeof DiscardPile>> = {}) =>
  render(
    <NextIntlClientProvider locale="en" messages={{ game: gameMessages }} timeZone="America/Sao_Paulo">
      <DiscardPile
        cards={[card()]}
        amountToBuy={0}
        canBuyCard={false}
        onBuyCard={jest.fn()}
        pileRef={createRef<HTMLDivElement>()}
        {...props}
      />
    </NextIntlClientProvider>,
  )

describe('DiscardPile', () => {
  it('renders the top card', () => {
    renderPile()
    expect(screen.getByAltText('Red 5')).toBeInTheDocument()
  })

  it('shows the combo amount when there is a pending buy', () => {
    renderPile({ amountToBuy: 4 })
    expect(screen.getByText('+4')).toBeInTheDocument()
  })

  it('shows the buy button only when the current player can buy', async () => {
    const onBuyCard = jest.fn()
    renderPile({ canBuyCard: true, onBuyCard })

    const user = userEvent.setup()
    await user.click(screen.getByText(gameMessages.buyCard))

    expect(onBuyCard).toHaveBeenCalled()
  })

  it('does not render the buy button when the player cannot buy', () => {
    renderPile({ canBuyCard: false })
    expect(screen.queryByText(gameMessages.buyCard)).not.toBeInTheDocument()
  })
})
