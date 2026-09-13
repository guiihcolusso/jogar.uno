'use client'

import { useState } from 'react'

import { Avatar, Button, Input } from '@heroui/react'
import { Pencil } from 'lucide-react'

import { useLocale } from '@/shared/i18n'
import { useGameSession } from '@/shared/socket'

import { styles } from './player-badge.styles'

/**
 * Shows the current guest identity in the navbar (replaces the boilerplate's
 * `UserDropdown` — this app has no real accounts). Clicking it lets the
 * player rename themselves without leaving the page.
 */
export const PlayerBadge = () => {
  const { player, ready, changePlayerName } = useGameSession()
  const { buttons } = useLocale('common')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  if (!ready) return null

  const startEditing = () => {
    setName(player.name)
    setEditing(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) return

    await changePlayerName(trimmedName)
    setEditing(false)
  }

  if (editing) {
    return (
      <form className={styles.editForm()} onSubmit={handleSubmit}>
        <Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Player name" autoFocus />
        <Button type="submit" size="sm" variant="primary" isDisabled={!name.trim()}>
          {buttons.save}
        </Button>
      </form>
    )
  }

  return (
    <button type="button" onClick={startEditing} className={styles.trigger()} data-testid="player-badge">
      <Avatar className={styles.avatar()}>
        <Avatar.Fallback>{player.name.charAt(0).toUpperCase()}</Avatar.Fallback>
      </Avatar>
      <span className={styles.name()}>{player.name}</span>
      <Pencil size={12} aria-hidden="true" />
    </button>
  )
}
