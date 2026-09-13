import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'

import roomMessages from '@/modules/room/locales/en/room.json'

import { PlayerListItem } from './player-list-item.component'

const renderItem = (props: Partial<React.ComponentProps<typeof PlayerListItem>> = {}) =>
  render(
    <NextIntlClientProvider locale="en" messages={{ room: roomMessages }} timeZone="America/Sao_Paulo">
      <PlayerListItem name="Ada" ready={false} isYou={false} {...props} />
    </NextIntlClientProvider>,
  )

describe('PlayerListItem', () => {
  it('shows READY/UNREADY based on the ready flag', () => {
    const { rerender } = renderItem({ ready: false })
    expect(screen.getByText(roomMessages.playerStatus.unready)).toBeInTheDocument()

    rerender(
      <NextIntlClientProvider locale="en" messages={{ room: roomMessages }} timeZone="America/Sao_Paulo">
        <PlayerListItem name="Ada" ready isYou={false} />
      </NextIntlClientProvider>,
    )
    expect(screen.getByText(roomMessages.playerStatus.ready)).toBeInTheDocument()
  })

  it('marks the current player as "(You)"', () => {
    renderItem({ isYou: true })
    expect(screen.getByText(roomMessages.playerStatus.you)).toBeInTheDocument()
  })
})
