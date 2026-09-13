import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'

import { NotFoundData } from './not-found-data.component'

const messages = {
  errors: { notFound: 'Conteúdo não encontrado' },
  common: { buttons: { tryAgain: 'Tentar novamente', backToHome: 'Voltar' } },
}

describe('NotFoundData', () => {
  it('renderiza fallback de notFound', () => {
    render(
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <NotFoundData />
      </NextIntlClientProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Conteúdo não encontrado' })).toBeInTheDocument()
  })
})
