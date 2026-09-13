import { Avatar } from '@heroui/react'

import { PlayerReaction } from '../player-reaction'
import { styles } from './player-seat.styles'
import type { PlayerSeatParams } from './player-seat.types'

/** An opponent's seat around the table — avatar, name, and hand size. */
export const PlayerSeat = ({ player, position }: PlayerSeatParams) => {
  if (!player) return null

  return (
    <div className={styles.container({ position })} data-testid={`player-seat-${position}`}>
      <div className="relative">
        <PlayerReaction playerId={player.id} />

        <div className={styles.avatarWrapper({ active: player.isCurrentRoundPlayer })}>
          <Avatar className={styles.avatar()}>
            <Avatar.Fallback>{player.name.charAt(0).toUpperCase()}</Avatar.Fallback>
          </Avatar>
        </div>

        <span className={styles.count()}>{player.handCards.length}</span>
      </div>

      <span className={styles.name()}>{player.name}</span>
      {player.handCards.length === 1 && <span className={styles.unoBadge()}>UNO!</span>}
    </div>
  )
}
