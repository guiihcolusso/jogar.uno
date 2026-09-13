import { render, screen } from '@testing-library/react'

import { BaseErrorScreen } from './base-error-screen.component'

describe('BaseErrorScreen', () => {
  it('renderiza título e descrição', () => {
    render(<BaseErrorScreen title="404" description="Página não encontrada" />)
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
  })

  it('renderiza ações primária e secundária quando informadas', () => {
    render(
      <BaseErrorScreen
        title="Erro"
        description="Mensagem"
        primaryAction={{ label: 'Tentar novamente' }}
        secondaryAction={{ label: 'Voltar', href: '/' }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
    // Button como `a` renderiza como link, não mantém role="button" no HeroUI.
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/')
  })
})
