import { render, screen } from '@testing-library/react'

import { If } from './If.component'

describe('If', () => {
  it('renderiza filhos quando condition é true', () => {
    render(
      <If condition={true}>
        <div data-testid="child">visible</div>
      </If>,
    )
    expect(screen.getByTestId('child')).toHaveTextContent('visible')
  })

  it('não renderiza filhos quando condition é false', () => {
    const { queryByTestId } = render(
      <If condition={false}>
        <div data-testid="child">hidden</div>
      </If>,
    )
    expect(queryByTestId('child')).not.toBeInTheDocument()
  })
})
