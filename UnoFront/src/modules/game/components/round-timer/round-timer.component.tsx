import { styles } from './round-timer.styles'
import type { RoundTimerParams } from './round-timer.types'

export const RoundTimer = ({ remainingSeconds, maxSeconds, currentPlayerName }: RoundTimerParams) => {
  const percentage = maxSeconds > 0 ? Math.max(0, Math.min(100, (remainingSeconds / maxSeconds) * 100)) : 0
  const isLow = remainingSeconds <= 5

  return (
    <div className={styles.container()} data-testid="round-timer">
      {currentPlayerName && <span className={styles.label()}>{currentPlayerName}</span>}
      <div className={styles.track()}>
        <div className={styles.fill({ low: isLow })} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
