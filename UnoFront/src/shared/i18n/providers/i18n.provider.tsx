'use client'

import type { ReactNode } from 'react'
import { type AbstractIntlMessages,NextIntlClientProvider } from 'next-intl'

export type I18nProviderParams = {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
  timeZone?: string
}

export const I18nProvider = ({ children, locale, messages, timeZone = 'America/Sao_Paulo' }: I18nProviderParams) => (
  <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
    {children}
  </NextIntlClientProvider>
)
