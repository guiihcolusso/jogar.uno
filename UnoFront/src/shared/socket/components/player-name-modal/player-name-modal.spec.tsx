import { NextIntlClientProvider } from 'next-intl'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import socketMessages from '@/shared/socket/locales/en/socket.json'

import { PlayerNameModal } from './player-name-modal.component'

const renderModal = (onSubmit = jest.fn().mockResolvedValue(undefined)) => {
  render(
    <NextIntlClientProvider locale="en" messages={{ socket: socketMessages }} timeZone="America/Sao_Paulo">
      <PlayerNameModal onSubmit={onSubmit} />
    </NextIntlClientProvider>,
  )
  return onSubmit
}

describe('PlayerNameModal', () => {
  it('keeps the confirm button disabled until a name is typed', async () => {
    renderModal()
    expect(screen.getByText(socketMessages.nameModal.confirm)).toBeDisabled()

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(socketMessages.nameModal.placeholder), 'Ada')

    expect(screen.getByText(socketMessages.nameModal.confirm)).not.toBeDisabled()
  })

  it('submits the trimmed name', async () => {
    const onSubmit = renderModal()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText(socketMessages.nameModal.placeholder), '  Ada  ')
    await user.click(screen.getByText(socketMessages.nameModal.confirm))

    expect(onSubmit).toHaveBeenCalledWith('Ada')
  })
})
