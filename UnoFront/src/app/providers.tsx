import { type ReactNode, Suspense } from 'react'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'

import { Toast } from '@heroui/react'
import { SerwistProvider } from '@serwist/next/react'

import { env } from '@/config/env'
import { I18nProvider } from '@/shared/i18n'
import { GlobalLoadingOverlay, GlobalLoadingProvider } from '@/shared/loading'
import { ReactQueryProvider } from '@/shared/query-client'
import { NuqsProvider } from '@/shared/query-states/providers'
import { GameSessionProvider, SocketProvider } from '@/shared/socket'

export type ProvidersParams = {
  children: ReactNode
}

export const Providers = async ({ children }: ProvidersParams) => {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <SerwistProvider swUrl="/sw.js" disable={env.APP_ENV === 'development'}>
      <ReactQueryProvider>
        <I18nProvider locale={locale} messages={messages}>
          <GlobalLoadingProvider>
            <GlobalLoadingOverlay />
            <NuqsProvider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <Toast.Provider placement="top end" />
                <SocketProvider>
                  <GameSessionProvider>
                    <Suspense>{children}</Suspense>
                  </GameSessionProvider>
                </SocketProvider>
              </ThemeProvider>
            </NuqsProvider>
          </GlobalLoadingProvider>
        </I18nProvider>
      </ReactQueryProvider>
    </SerwistProvider>
  )
}
