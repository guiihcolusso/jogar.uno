'use client'

import { useState } from 'react'

import { Button, Input } from '@heroui/react'
import { Sparkles } from 'lucide-react'

import { useLocale } from '@/shared/i18n'

import { styles } from './player-name-modal.styles'
import type { PlayerNameModalParams } from './player-name-modal.types'

/**
 * Blocks the app behind a full-screen "enter your name" gate — the game has
 * no real accounts, only a guest display name persisted in localStorage
 * (see `playerStorage`). Rendered by `GameSessionProvider` whenever no
 * identity is stored yet.
 */
export const PlayerNameModal = ({ onSubmit }: PlayerNameModalParams) => {
  const { nameModal } = useLocale('socket')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName || submitting) return

    setSubmitting(true)
    await onSubmit(trimmedName).catch(() => setSubmitting(false))
  }

  return (
    <div className={styles.backdrop()}>
      <div className={styles.container()}>
        <Sparkles className={styles.logo()} aria-hidden="true" />
        <h1 className={styles.title()}>{nameModal.title}</h1>
        <p className={styles.subtitle()}>{nameModal.subtitle}</p>

        <form className={styles.form()} onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={nameModal.placeholder}
            aria-label={nameModal.placeholder}
            required
            autoFocus
          />

          <Button type="submit" variant="primary" isDisabled={!name.trim() || submitting} className={styles.submit()}>
            {nameModal.confirm}
          </Button>
        </form>
      </div>
    </div>
  )
}
