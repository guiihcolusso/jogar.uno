'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Skeleton } from '@heroui/react'
import { Plus } from 'lucide-react'

import { useLocale } from '@/shared/i18n'
import { useGameSession } from '@/shared/socket'

import { GameCard } from '../../components/game-card'
import { useGames } from '../../hooks'
import { styles } from './dashboard-screen.styles'

export const DashboardScreen = () => {
  const { title, createGame: createGameLabel, creating, empty } = useLocale('dashboard')
  const { data: games, isLoading } = useGames()
  const { createGame } = useGameSession()
  const router = useRouter()

  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGame = async () => {
    setIsCreating(true)

    try {
      const { gameId } = await createGame()
      router.push(`/${gameId}`)
    } finally {
      setIsCreating(false)
    }
  }

  const openGames = (games ?? []).filter((game) => game.status !== 'ended').sort((a, b) => b.createdAt - a.createdAt)

  return (
    <main className={styles.screen()}>
      <div className={styles.header()}>
        <h1 className={styles.title()}>{title}</h1>

        <Button variant="primary" onPress={handleCreateGame} isDisabled={isCreating}>
          <Plus size={16} aria-hidden="true" />
          {isCreating ? creating : createGameLabel}
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.grid()}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : openGames.length === 0 ? (
        <p className={styles.empty()}>{empty}</p>
      ) : (
        <div className={styles.grid()}>
          {openGames.map((game) => (
            <GameCard key={game.id} game={game} onOpen={(gameId) => router.push(`/${gameId}`)} />
          ))}
        </div>
      )}
    </main>
  )
}
