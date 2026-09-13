'use client'

import { useMessages } from 'next-intl'

import type { Messages } from '@/config/i18n'

/**
 * Retorna todas as mensagens i18n ou um namespace específico tipado.
 *
 * Diferente de `useTranslations`, expõe o JSON cru (útil para iterar listas
 * dinâmicas dentro de um namespace).
 */
export function useLocale(): Messages
export function useLocale<NS extends keyof Messages>(namespace: NS): Messages[NS]
export function useLocale(namespace?: keyof Messages): unknown {
  const messages = useMessages() as Messages
  return namespace ? messages[namespace] : messages
}
