'use client'

import { Modal } from '@heroui/react'

import { useLocale } from '@/shared/i18n'
import type { CardColors } from '@/shared/socket'
import { TOKENS } from '@/shared/theme'

import { styles } from './color-picker-modal.styles'
import type { ColorPickerModalParams } from './color-picker-modal.types'

const SELECTABLE_COLORS: CardColors[] = ['red', 'yellow', 'green', 'blue']

/** Wild-card color picker, shown after playing `change-color` / `buy-4`. */
export const ColorPickerModal = ({ isOpen, onSelect }: ColorPickerModalParams) => {
  const { colorPicker } = useLocale('game')

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onSelect('')}>
      <Modal.Backdrop variant="blur">
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{colorPicker.title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className={styles.grid()}>
                {SELECTABLE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={colorPicker.colors[color as Exclude<CardColors, '' | 'black'>]}
                    onClick={() => onSelect(color)}
                    className={styles.swatch()}
                    style={{
                      backgroundColor: TOKENS.cardColors[color].base,
                      boxShadow: `0 0 20px ${TOKENS.cardColors[color].glow}`,
                    }}
                  />
                ))}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
