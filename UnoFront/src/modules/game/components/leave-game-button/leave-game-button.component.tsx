'use client'

import { AlertDialog, Button, useOverlayState } from '@heroui/react'
import { LogOut } from 'lucide-react'

import { useLocale } from '@/shared/i18n'

import { styles } from './leave-game-button.styles'
import type { LeaveGameButtonParams } from './leave-game-button.types'

/** Confirm-before-leaving prompt — replaces the CRA app's `CloseGamePrompt`. */
export const LeaveGameButton = ({ onConfirm }: LeaveGameButtonParams) => {
  const { leaveGame } = useLocale('game')
  const state = useOverlayState()

  return (
    <>
      <Button
        isIconOnly
        variant="ghost"
        aria-label={leaveGame.trigger}
        onPress={state.open}
        className={styles.trigger()}
      >
        <LogOut size={18} />
      </Button>

      <AlertDialog.Root isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <AlertDialog.Backdrop variant="blur">
          <AlertDialog.Container size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Header>
                <AlertDialog.Heading>{leaveGame.title}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>{leaveGame.description}</AlertDialog.Body>
              <AlertDialog.Footer>
                <div className={styles.footer()}>
                  <Button variant="ghost" onPress={state.close}>
                    {leaveGame.cancel}
                  </Button>
                  <Button
                    variant="danger"
                    onPress={() => {
                      state.close()
                      onConfirm()
                    }}
                  >
                    {leaveGame.confirm}
                  </Button>
                </div>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog.Root>
    </>
  )
}
