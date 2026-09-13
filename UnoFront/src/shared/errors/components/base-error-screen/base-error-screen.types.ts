import type { ReactNode } from 'react'

export type BaseErrorScreenAction = {
  label: string
  href?: string
  onPress?: () => void
}

export type BaseErrorScreenParams = {
  title: string
  description: ReactNode
  primaryAction?: BaseErrorScreenAction
  secondaryAction?: BaseErrorScreenAction
  containerClassName?: string
  iconSlot?: ReactNode
}
