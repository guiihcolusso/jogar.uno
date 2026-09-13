import { getRequestConfig } from 'next-intl/server'

import { dashboardLocales, type DashboardMessages } from '@/modules/dashboard'
import { gameLocales, type GameMessages } from '@/modules/game'
import { roomLocales, type RoomMessages } from '@/modules/room'
import { errorsLocales, type ErrorsMessages } from '@/shared/errors'
import { commonLocales, type CommonMessages } from '@/shared/i18n'
import { socketLocales, type SocketMessages } from '@/shared/socket'

export const I18N = {
  DEFAULT_LOCALE: 'en',
  TIME_ZONE: 'America/Sao_Paulo',
  LOCALES: ['en'] as const,
} as const

export type SupportedLocale = (typeof I18N.LOCALES)[number]

/**
 * Registry of locales per module. Add/remove a module = one line here.
 * Each module exposes `{name}Locales` through its own barrel.
 */
const LOCALE_REGISTRY = {
  common: commonLocales,
  errors: errorsLocales,
  socket: socketLocales,
  dashboard: dashboardLocales,
  room: roomLocales,
  game: gameLocales,
} as const

export type Messages = {
  common: CommonMessages
  errors: ErrorsMessages
  socket: SocketMessages
  dashboard: DashboardMessages
  room: RoomMessages
  game: GameMessages
}

async function loadMessages(locale: SupportedLocale): Promise<Messages> {
  return Object.fromEntries(
    Object.entries(LOCALE_REGISTRY).map(([namespace, locales]) => [namespace, locales[locale]]),
  ) as Messages
}

export default getRequestConfig(async () => {
  const locale = I18N.DEFAULT_LOCALE
  const messages = await loadMessages(locale)
  return {
    locale,
    messages,
    timeZone: I18N.TIME_ZONE,
  }
})
