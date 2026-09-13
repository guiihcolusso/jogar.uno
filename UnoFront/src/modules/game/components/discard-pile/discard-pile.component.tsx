'use client'

import type { CSSProperties } from 'react'

import { Button } from '@heroui/react'

import { useLocale } from '@/shared/i18n'

import { PlayingCard } from '../playing-card'
import { styles } from './discard-pile.styles'
import type { DiscardPileParams } from './discard-pile.types'

const MAX_VISIBLE_CARDS = 5

/** The center pile — also the drop target for dragging a hand card onto. */
export const DiscardPile = ({ cards, amountToBuy, canBuyCard, onBuyCard, pileRef, isDropTarget }: DiscardPileParams) => {
  const { buyCard } = useLocale('game')

  return (
    <div ref={pileRef} className={styles.container({ isDropTarget })} data-testid="discard-pile">
      {amountToBuy > 0 && <div className={styles.combo()}>+{amountToBuy}</div>}

      {cards.slice(0, MAX_VISIBLE_CARDS).map((card, index) => (
        <PlayingCard
          key={card.id}
          card={card}
          size="lg"
          dimmed={index !== 0}
          className={styles.card()}
          style={{ '--rotate': `${index * -4}deg`, zIndex: MAX_VISIBLE_CARDS - index } as CSSProperties}
        />
      ))}

      {canBuyCard && (
        <Button variant="secondary" size="sm" onPress={onBuyCard} className={styles.buyButton()}>
          {buyCard}
        </Button>
      )}
    </div>
  )
}
