import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'

import { InternalError } from './internal-error.component'

const messages = {
  errors: { generic: 'Erro interno' },
  common: { buttons: { tryAgain: 'Tentar novamente', backToHome: 'Voltar' } },
}

describe('InternalError', () => {
  it('renderiza statusCode default e mensagem genérica', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <InternalError />
      </NextIntlClientProvider>,
    )
    expect(screen.getByRole('heading', { name: '500' })).toBeInTheDocument()
    expect(screen.getByText('Erro interno')).toBeInTheDocument()
  })
})
