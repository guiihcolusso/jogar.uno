import { render, screen } from '@testing-library/react'

import { LabelField } from './label-field.component'

describe('LabelField', () => {
  it('renderiza label associado a um input por htmlFor', () => {
    render(<LabelField label="Nome" htmlFor="name" placeholder="Digite seu nome" />)
    const input = screen.getByLabelText('Nome')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'name')
  })

  it('aceita prop "as" para renderizar outro elemento', () => {
    render(<LabelField label="Descrição" htmlFor="description" as="textarea" />)
    const textarea = screen.getByLabelText('Descrição')
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
  })
})
