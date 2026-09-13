import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import roomMessages from '@/modules/room/locales/en/room.json'

import { RoomScreen } from './room-screen.screen'

const toggleReadyMock = jest.fn()
const useRoomMock = jest.fn()

jest.mock('../../hooks', () => ({
  useRoom: (params: unknown) => useRoomMock(params),
}))

const player = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'p1',
  name: 'Ada',
  ready: false,
  isCurrentRoundPlayer: false,
  ...overrides,
})

const renderScreen = () =>
  render(
    <NextIntlClientProvider locale="en" messages={{ room: roomMessages }} timeZone="America/Sao_Paulo">
      <RoomScreen gameId="game-1" />
    </NextIntlClientProvider>,
  )

describe('RoomScreen', () => {
  beforeEach(() => {
    toggleReadyMock.mockClear()
  })

  it('shows a spinner while loading', () => {
    useRoomMock.mockReturnValue({ loading: true })
    renderScreen()
    expect(screen.getByTestId('Spinner')).toBeInTheDocument()
  })

  it('lists players and shows the ready toggle', async () => {
    useRoomMock.mockReturnValue({
      loading: false,
      game: { title: 'Table 1', players: [player()] },
      currentPlayer: player(),
      toggleReady: toggleReadyMock,
    })
    const user = userEvent.setup()
    renderScreen()

    expect(screen.getByText('Ada')).toBeInTheDocument()
    await user.click(screen.getByText(roomMessages.getReady))
    expect(toggleReadyMock).toHaveBeenCalled()
  })
})
