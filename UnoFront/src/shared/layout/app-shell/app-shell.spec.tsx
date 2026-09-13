import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'

import commonMessages from '@/shared/i18n/locales/en/common.json'

import { AppShell } from './app-shell.component'

jest.mock('@/shared/layout/env-bar', () => ({
  EnvBar: ({ env }: { env: string }) => <div data-testid="env-bar">{env}</div>,
}))

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

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <NextIntlClientProvider locale="en" messages={{ common: commonMessages }} timeZone="America/Sao_Paulo">
      {ui}
    </NextIntlClientProvider>,
  )

describe('AppShell', () => {
  it('renders children inside the shell', () => {
    renderWithProviders(
      <AppShell>
        <main data-testid="content">Content</main>
      </AppShell>,
    )
    expect(screen.getByTestId('content')).toHaveTextContent('Content')
  })

  it('renders the Navbar (logo) composing the header', () => {
    renderWithProviders(
      <AppShell>
        <span>x</span>
      </AppShell>,
    )
    expect(screen.getByText('UNO')).toBeInTheDocument()
  })
})
