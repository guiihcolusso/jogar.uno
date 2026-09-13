'use client'

import { Button, Spinner } from '@heroui/react'
import { Check, X } from 'lucide-react'

import { useLocale } from '@/shared/i18n'

import { PlayerListItem } from '../../components/player-list-item'
import { useRoom } from '../../hooks'
import { styles } from './room-screen.styles'
import type { RoomScreenParams } from './room-screen.types'

export const RoomScreen = ({ gameId }: RoomScreenParams) => {
  const { title, players: playersLabel, getReady, cancelReady } = useLocale('room')
  const { loading, game, currentPlayer, toggleReady } = useRoom({ gameId })

  if (loading) {
    return (
      <div className={styles.loading()}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <main className={styles.screen()}>
      <div className={styles.header()}>
        <h1 className={styles.title()}>
          {title} <span className={styles.titleAccent()}>/{game?.title}</span>
        </h1>

        <Button variant={currentPlayer?.ready ? 'outline' : 'primary'} onPress={toggleReady}>
          {currentPlayer?.ready ? <X size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
          {currentPlayer?.ready ? cancelReady : getReady}
        </Button>
      </div>

      <div>
        <p className={styles.sectionTitle()}>{playersLabel}</p>

        <div className={styles.list()}>
          {game?.players.map((player) => (
            <PlayerListItem
              key={player.id}
              name={player.name}
              ready={player.ready}
              isYou={player.id === currentPlayer?.id}
              isCurrentRoundPlayer={player.isCurrentRoundPlayer}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
