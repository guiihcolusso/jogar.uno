'use client'

import { useLocale } from '@/shared/i18n'

import { BaseErrorScreen } from '../../components/base-error-screen'

export const NotFoundScreen = () => {
  const errors = useLocale('errors')
  const common = useLocale('common')
  return (
    <BaseErrorScreen
      title="404"
      description={errors.notFound}
      secondaryAction={{ label: common.buttons.backToHome, href: '/' }}
      containerClassName="bg-white w-screen h-screen"
    />
  )
}
