import type { PlayerData } from '@/shared/socket'

/**
 * Named seat around the table. Ported as-is from the CRA app's layout math
 * — the local player always renders at `bottom`, everyone else rotates
 * around them based on player count and turn order.
 */
export type TableSeatPosition =
  | 'left'
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'right'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'

const POSITIONS_BY_PLAYER_COUNT: Record<number, TableSeatPosition[]> = {
  1: ['bottom'],
  2: ['bottom', 'top'],
  3: ['bottom', 'right', 'left'],
  4: ['bottom', 'right', 'top', 'left'],
  5: ['bottom', 'right', 'topRight', 'top', 'left'],
  6: ['bottom', 'right', 'topRight', 'top', 'topLeft', 'left'],
  7: ['bottom', 'bottomRight', 'right', 'topRight', 'top', 'topLeft', 'left'],
  8: ['bottom', 'bottomRight', 'right', 'topRight', 'top', 'topLeft', 'left', 'bottomLeft'],
}

function wrap(value: number, max: number, min: number): number {
  if (value >= max) return value % max
  if (value <= min) return Math.abs(max - Math.abs(value)) % max
  return value
}

/**
 * Rotates the player list so the local player is always at `bottom`,
 * fanning everyone else clockwise from there.
 */
export function getLayoutedPlayers(
  players: PlayerData[],
  localPlayerId: string | undefined,
): Partial<Record<TableSeatPosition, PlayerData>> {
  const positions = POSITIONS_BY_PLAYER_COUNT[players.length]
  if (!positions) return {}

  const localPlayerIndex = players.findIndex((player) => player.id === localPlayerId)
  const isSpectator = localPlayerIndex === -1

  const layout: Partial<Record<TableSeatPosition, PlayerData>> = {}

  players.forEach((player, index) => {
    const diff = isSpectator ? 0 : localPlayerIndex
    const positionIndex = wrap(players.length - diff + index, players.length, 0)
    layout[positions[positionIndex]] = player
  })

  return layout
}
