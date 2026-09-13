import { Avatar } from '@heroui/react'
import { Star } from 'lucide-react'

import { useLocale } from '@/shared/i18n'

import { styles } from './player-list-item.styles'
import type { PlayerListItemParams } from './player-list-item.types'

export const PlayerListItem = ({ name, ready, isYou, isCurrentRoundPlayer }: PlayerListItemParams) => {
  const { playerStatus } = useLocale('room')

  return (
    <div className={styles.container()}>
      <div className={styles.info()}>
        <Avatar className={styles.avatar()}>
          <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-1.5">
            <span className={styles.name()}>{name}</span>
            {isCurrentRoundPlayer && <Star size={14} className="text-accent-3" aria-hidden="true" />}
          </div>
          {isYou && <span className={styles.you()}>{playerStatus.you}</span>}
        </div>
      </div>

      <span className={styles.status({ ready })}>{ready ? playerStatus.ready : playerStatus.unready}</span>
    </div>
  )
}
