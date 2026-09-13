export { commonLocales, type CommonMessages } from './locales'
export type { I18nProviderParams } from './providers'
export { I18nProvider } from './providers'
export { useLocale } from './use-locale.hook'
// `useTranslate` é re-export tipado de `useTranslations` do `next-intl` —
// uso apenas quando precisar de interpolação dinâmica (`translate('greeting', { name })`)
// ou pluralização ICU. Para texto estático, prefira `useLocale` (mais simples + tipado).
export { useTranslations as useTranslate } from 'next-intl'
