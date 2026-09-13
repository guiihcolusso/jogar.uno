'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { useLocale } from '@/shared/i18n'
import type {
  PlayerBlockedEventData,
  PlayerBuyCardsEventData,
  PlayerUnoEventData,
} from '@/shared/socket'
import { useSocket } from '@/shared/socket'

import { styles } from './player-reaction.styles'
import type { PlayerReactionParams } from './player-reaction.types'

const REACTION_DURATION_MS = 2000

/** Floating "UNO!" / "BLOCKED!" / "BUY N!" bubble above a seat's avatar. */
export const PlayerReaction = ({ playerId }: PlayerReactionParams) => {
  const { reactions } = useLocale('game')
  const { on } = useSocket()
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribers = [
      on<PlayerUnoEventData>('PlayerUno', (data) => {
        if (data.playerId === playerId) setMessage(reactions.uno)
      }),
      on<PlayerBlockedEventData>('PlayerBlocked', (data) => {
        if (data.playerId === playerId) setMessage(reactions.blocked)
      }),
      on<PlayerBuyCardsEventData>('PlayerBuyCards', (data) => {
        if (data.playerId === playerId) setMessage(reactions.buyCards.replace('{amount}', String(data.amountToBuy)))
      }),
    ]

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [on, playerId, reactions])

  useEffect(() => {
    if (!message) return

    const timeout = setTimeout(() => setMessage(''), REACTION_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [message])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.8 }}
          className={styles.bubble()}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
