import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'

import { NotFoundScreen } from './not-found-screen.screen'

const messages = {
  errors: { notFound: 'We could not find what you were looking for.' },
  common: { buttons: { backToHome: 'Back to home' } },
}

describe('NotFoundScreen', () => {
  it('renders the 404 title and translated message', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <NotFoundScreen />
      </NextIntlClientProvider>,
    )
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(screen.getByText('We could not find what you were looking for.')).toBeInTheDocument()
  })
})
