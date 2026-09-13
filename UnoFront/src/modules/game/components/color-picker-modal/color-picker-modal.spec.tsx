import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import gameMessages from '@/modules/game/locales/en/game.json'

import { ColorPickerModal } from './color-picker-modal.component'

const renderModal = (onSelect = jest.fn()) => {
  render(
    <NextIntlClientProvider locale="en" messages={{ game: gameMessages }} timeZone="America/Sao_Paulo">
      <ColorPickerModal isOpen onSelect={onSelect} />
    </NextIntlClientProvider>,
  )
  return onSelect
}

describe('ColorPickerModal', () => {
  it('renders a swatch for each selectable color', () => {
    renderModal()
    ;(['red', 'yellow', 'green', 'blue'] as const).forEach((color) => {
      expect(screen.getByLabelText(gameMessages.colorPicker.colors[color])).toBeInTheDocument()
    })
  })

  it('calls onSelect with the chosen color', async () => {
    const onSelect = renderModal()
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(gameMessages.colorPicker.colors.green))

    expect(onSelect).toHaveBeenCalledWith('green')
  })
})
