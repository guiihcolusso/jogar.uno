'use client'

import { useState } from 'react'

import { Avatar, Button } from '@heroui/react'
import { motion,type MotionStyle, type PanInfo } from 'framer-motion'

import { useLocale } from '@/shared/i18n'
import type { CardData } from '@/shared/socket'

import { PlayingCard } from '../playing-card'
import { styles } from './player-hand.styles'
import type { PlayerHandParams } from './player-hand.types'

function isOverTarget(point: { x: number; y: number }, target: HTMLElement | null): boolean {
  if (!target) return false

  const rect = target.getBoundingClientRect()
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
}

function getFanRotation(index: number, count: number): number {
  const center = (count - 1) / 2
  return (index - center) * 4
}

export const PlayerHand = ({ player, pileRef, onPlayCards, onGoOnline, onDropTargetChange }: PlayerHandParams) => {
  const { hand, you, afk } = useLocale('game')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const cards = player.handCards

  const selectedType = cards.find((card) => card.id === selectedIds[0])?.type

  const toggleCard = (card: CardData) => {
    const isSelected = selectedIds.includes(card.id)

    if (isSelected) {
      setSelectedIds((current) => current.filter((id) => id !== card.id))
      return
    }

    if (selectedIds.length === 0) {
      if (!card.canBeUsed) return
      setSelectedIds([card.id])
      return
    }

    if (card.canBeCombed && card.type === selectedType) {
      setSelectedIds((current) => [...current, card.id])
    }
  }

  const playSelection = (cardIds: string[]) => {
    setSelectedIds([])
    onPlayCards(cardIds)
  }

  const handleDragEnd = (card: CardData, _event: PointerEvent, info: PanInfo) => {
    onDropTargetChange(false)

    if (!isOverTarget(info.point, pileRef.current)) return

    const cardIds = selectedIds.includes(card.id) && selectedIds.length > 1 ? selectedIds : [card.id]
    playSelection(cardIds)
  }

  return (
    <div className={styles.container()}>
      {player.status === 'afk' && (
        <div className={styles.afkBanner()}>
          <p>{afk.message}</p>
          <Button size="sm" variant="secondary" onPress={onGoOnline}>
            {afk.action}
          </Button>
        </div>
      )}

      <div className={styles.identity()}>
        <Avatar className={styles.avatar()}>
          <Avatar.Fallback>{player.name.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>
        <span className={styles.name()}>
          {player.name} <span className="text-default-500">({you})</span>
        </span>
      </div>

      <div className={styles.cardsRow({ empty: cards.length === 0 })} data-testid="player-hand">
        {cards.length === 0 && <p className="text-sm text-default-500">{hand.empty}</p>}

        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            role="button"
            tabIndex={0}
            aria-label={card.name}
            aria-pressed={selectedIds.includes(card.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggleCard(card)
              }
            }}
            onClick={() => toggleCard(card)}
            drag={card.canBeUsed}
            dragSnapToOrigin
            dragElastic={0.15}
            whileDrag={{ scale: 1.1, zIndex: 50 }}
            onDragStart={() => onDropTargetChange(true)}
            onDrag={(_event, info) => onDropTargetChange(isOverTarget(info.point, pileRef.current))}
            onDragEnd={(event, info) => handleDragEnd(card, event as PointerEvent, info)}
            className={styles.cardSlot()}
            style={{ '--rotate': `${getFanRotation(index, cards.length)}deg`, zIndex: index } as MotionStyle}
          >
            <PlayingCard
              card={card}
              size="md"
              selected={selectedIds.includes(card.id)}
              dimmed={!card.canBeUsed && !(selectedIds.length > 0 && card.canBeCombed && card.type === selectedType)}
              className={card.canBeUsed ? 'cursor-grab active:cursor-grabbing' : ''}
            />
          </motion.div>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <Button variant="primary" onPress={() => playSelection(selectedIds)}>
          {hand.play} ({selectedIds.length})
        </Button>
      )}
    </div>
  )
}
