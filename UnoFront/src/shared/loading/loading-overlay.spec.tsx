import { act, render, screen } from '@testing-library/react'

import { GlobalLoadingOverlay } from './loading-overlay.component'
import { GlobalLoadingProvider } from './providers'
import { useGlobalLoading } from './use-global-loading.hook'

const TriggerButton = () => {
  const { show, hide } = useGlobalLoading()
  return (
    <>
      <button type="button" onClick={show}>
        show
      </button>
      <button type="button" onClick={hide}>
        hide
      </button>
    </>
  )
}

const renderWithProvider = () =>
  render(
    <GlobalLoadingProvider>
      <GlobalLoadingOverlay />
      <TriggerButton />
    </GlobalLoadingProvider>,
  )

describe('GlobalLoadingOverlay', () => {
  it('não renderiza nada quando isLoading é false', () => {
    renderWithProvider()
    expect(screen.queryByTestId('global-loading-overlay')).not.toBeInTheDocument()
  })

  it('renderiza overlay quando show() é chamado', () => {
    renderWithProvider()
    act(() => {
      screen.getByText('show').click()
    })
    expect(screen.getByTestId('global-loading-overlay')).toBeInTheDocument()
  })

  it('esconde overlay novamente após hide()', () => {
    renderWithProvider()
    act(() => {
      screen.getByText('show').click()
    })
    act(() => {
      screen.getByText('hide').click()
    })
    expect(screen.queryByTestId('global-loading-overlay')).not.toBeInTheDocument()
  })
})
