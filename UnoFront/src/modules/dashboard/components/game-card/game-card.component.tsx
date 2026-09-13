'use client'

import { Avatar, Button, Chip } from '@heroui/react'

import { useLocale } from '@/shared/i18n'

import { styles } from './game-card.styles'
import type { GameCardParams } from './game-card.types'

const STATUS_ACTION_KEY = {
  waiting: 'join',
  playing: 'spectate',
  ended: 'ended',
} as const

export const GameCard = ({ game, onOpen }: GameCardParams) => {
  const { gameCard } = useLocale('dashboard')
  const remainingSlots = Math.max(game.maxPlayers - game.players.length, 0)
  const actionLabel = gameCard.actions[STATUS_ACTION_KEY[game.status]]

  return (
    <div className={styles.card()} data-testid="game-card">
      <div className={styles.header()}>
        <div className="min-w-0">
          <p className={styles.title()}>{game.title}</p>
          <p className={styles.subtitle()}>#{game.id}</p>
        </div>
        <Chip size="sm" color={game.status === 'playing' ? 'success' : game.status === 'ended' ? 'danger' : 'warning'}>
          <Chip.Label>{gameCard.status[game.status]}</Chip.Label>
        </Chip>
      </div>

      <div className={styles.footer()}>
        <div className={styles.avatars()}>
          {game.players.slice(0, 5).map((player) => (
            <Avatar key={player.id} className={styles.avatar()}>
              <Avatar.Fallback>{player.name.charAt(0).toUpperCase()}</Avatar.Fallback>
            </Avatar>
          ))}
          {remainingSlots > 0 && <div className={styles.avatarPlaceholder()} />}
        </div>

        <span className={styles.slots()}>
          {remainingSlots} {remainingSlots === 1 ? gameCard.slot : gameCard.slots}
        </span>
      </div>

      <Button
        variant={game.status === 'waiting' ? 'primary' : 'outline'}
        isDisabled={game.status === 'ended'}
        onPress={() => onOpen(game.id)}
        fullWidth
      >
        {actionLabel}
      </Button>
    </div>
  )
}
