import type { CardColors } from '@/shared/socket'

export type ColorPickerModalParams = {
  isOpen: boolean
  onSelect: (color: CardColors) => void
}
