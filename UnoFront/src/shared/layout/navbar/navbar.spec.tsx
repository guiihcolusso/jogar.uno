import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'

import commonMessages from '@/shared/i18n/locales/en/common.json'

import { Navbar } from './navbar.component'

jest.mock(
  'lucide-react',
  () =>
    new Proxy(
      {},
      {
        get: (_t, name) =>
          function MockIcon() {
            return <span data-testid={`icon-${String(name)}`} />
          },
      },
    ),
)

jest.mock('@/shared/socket', () => ({
  useGameSession: () => ({ player: { id: '1', name: 'Ada' }, ready: true, changePlayerName: jest.fn() }),
}))

const renderWithI18n = (ui: React.ReactElement) =>
  render(
    <NextIntlClientProvider locale="en" messages={{ common: commonMessages }} timeZone="America/Sao_Paulo">
      {ui}
    </NextIntlClientProvider>,
  )

describe('Navbar', () => {
  it('renders the wordmark logo', () => {
    renderWithI18n(<Navbar />)
    expect(screen.getByText('UNO')).toBeInTheDocument()
  })

  it('renders the current player badge', () => {
    renderWithI18n(<Navbar />)
    expect(screen.getByTestId('player-badge')).toHaveTextContent('Ada')
  })
})
