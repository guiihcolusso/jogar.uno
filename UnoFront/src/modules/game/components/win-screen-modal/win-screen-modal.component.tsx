'use client'

import { useState } from 'react'

import { Button, Modal } from '@heroui/react'
import { Trophy } from 'lucide-react'

import { useLocale } from '@/shared/i18n'

import { styles } from './win-screen-modal.styles'
import type { WinScreenModalParams } from './win-screen-modal.types'

export const WinScreenModal = ({
  isOpen,
  winnerName,
  isCurrentPlayer,
  isWaitingForNewGame,
  onPlayAgain,
  onQuit,
}: WinScreenModalParams) => {
  const { winScreen } = useLocale('game')
  const [waiting, setWaiting] = useState(isWaitingForNewGame)

  const handlePlayAgain = () => {
    setWaiting(true)
    onPlayAgain()
  }

  return (
    <Modal isOpen={isOpen}>
      <Modal.Backdrop variant="blur" isDismissable={false}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Body>
              <div className={styles.body()}>
                <Trophy className={styles.trophy()} aria-hidden="true" />
                <p className={styles.winnerName()}>{winnerName}</p>
                {isCurrentPlayer && <p className={styles.you()}>{winScreen.you}</p>}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className={styles.footer()}>
                <Button variant="primary" onPress={handlePlayAgain} isDisabled={waiting} fullWidth>
                  {waiting ? winScreen.waiting : winScreen.playAgain}
                </Button>
                <Button variant="ghost" onPress={onQuit} fullWidth>
                  {winScreen.quit}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
