'use client'

import { useLocale } from '@/shared/i18n'

import { BaseErrorScreen } from '../base-error-screen'
import type { NotFoundDataParams } from './not-found-data.types'

export const NotFoundData = ({ title, description, onRetry, initialPageHref = '/' }: NotFoundDataParams) => {
  const errors = useLocale('errors')
  const common = useLocale('common')
  return (
    <BaseErrorScreen
      title={title ?? errors.notFound}
      description={description ?? errors.notFound}
      primaryAction={onRetry ? { label: common.buttons.tryAgain, onPress: onRetry } : undefined}
      secondaryAction={{ label: common.buttons.backToHome, href: initialPageHref }}
    />
  )
}
