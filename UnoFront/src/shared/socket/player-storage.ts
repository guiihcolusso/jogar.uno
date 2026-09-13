import type { Player } from './socket.types'

const STORAGE_KEY = 'uno:player'

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `player-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Guest identity persistence — no real auth, just `{ id, name }` in localStorage. */
export const playerStorage = {
  get(): Player | null {
    if (typeof window === 'undefined') return null

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Player) : null
    } catch {
      return null
    }
  },

  set(player: Player): void {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
    } catch {
      // best-effort — a private/blocked storage should not crash the app
    }
  },

  createGuestName(name: string): Player {
    const existing = playerStorage.get()

    return {
      id: existing?.id ?? generateId(),
      name,
    }
  },
}
