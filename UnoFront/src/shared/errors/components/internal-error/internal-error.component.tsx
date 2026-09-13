'use client'

import { useLocale } from '@/shared/i18n'

import { BaseErrorScreen } from '../base-error-screen'
import type { InternalErrorParams } from './internal-error.types'

export const InternalError = ({ statusCode = 500, message, onRetry, initialPageHref = '/' }: InternalErrorParams) => {
  const errors = useLocale('errors')
  const common = useLocale('common')
  return (
    <BaseErrorScreen
      title={`${statusCode}`}
      description={message ?? errors.generic}
      primaryAction={onRetry ? { label: common.buttons.tryAgain, onPress: onRetry } : undefined}
      secondaryAction={{ label: common.buttons.backToHome, href: initialPageHref }}
    />
  )
}
