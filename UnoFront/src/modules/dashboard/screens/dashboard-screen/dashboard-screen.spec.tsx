import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import dashboardMessages from '@/modules/dashboard/locales/en/dashboard.json'

import { DashboardScreen } from './dashboard-screen.screen'

const pushMock = jest.fn()
const createGameMock = jest.fn().mockResolvedValue({ gameId: 'abc123' })
const useGamesMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('@/shared/socket', () => ({
  useGameSession: () => ({ createGame: createGameMock }),
}))

jest.mock('../../hooks', () => ({
  useGames: () => useGamesMock(),
}))

const renderScreen = () =>
  render(
    <NextIntlClientProvider locale="en" messages={{ dashboard: dashboardMessages }} timeZone="America/Sao_Paulo">
      <DashboardScreen />
    </NextIntlClientProvider>,
  )

describe('DashboardScreen', () => {
  beforeEach(() => {
    pushMock.mockClear()
    createGameMock.mockClear()
  })

  it('renders the empty state when there are no open games', () => {
    useGamesMock.mockReturnValue({ data: [], isLoading: false })
    renderScreen()
    expect(screen.getByText(dashboardMessages.empty)).toBeInTheDocument()
  })

  it('renders a card per open game, filtering out ended games', () => {
    useGamesMock.mockReturnValue({
      data: [
        { id: '1', title: 'Table 1', status: 'waiting', maxPlayers: 4, players: [], createdAt: 2 },
        { id: '2', title: 'Table 2', status: 'ended', maxPlayers: 4, players: [], createdAt: 1 },
      ],
      isLoading: false,
    })
    renderScreen()
    expect(screen.getAllByTestId('game-card')).toHaveLength(1)
    expect(screen.getByText('Table 1')).toBeInTheDocument()
  })

  it('creates a game and navigates to its room', async () => {
    useGamesMock.mockReturnValue({ data: [], isLoading: false })
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByText(dashboardMessages.createGame))

    expect(createGameMock).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/abc123')
  })
})
