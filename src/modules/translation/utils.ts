import {
  IntlProvider,
  createIntl,
  createIntlCache,
  FormattedMessage
} from 'react-intl'
import { Locale } from 'decentraland-ui/dist/components/Language/Language'

const cache = createIntlCache()
let currentLocale: ReturnType<typeof createIntl>

export const I18nProvider = IntlProvider

export function getPreferredLocale(availableLocales: Locale[]): Locale | null {
  if (!availableLocales) {
    throw new Error('Failed to get preferred locale: Missing locale list')
  }

  const navigator = window.navigator

  const navigatorLocale =
    (navigator.languages && navigator.languages[0]) || navigator.language

  let locale: Locale = navigatorLocale.slice(0, 2) as Locale

  if (!availableLocales.includes(locale)) {
    return null
  }

  return locale
}

export function setCurrentLocale(
  localeName: Locale,
  messages: Record<string, string>
) {
  const locale = {
    en: 'en-EN',
    es: 'es-ES',
    fr: 'fr-FR',
    ko: 'ko-KR',
    zh: 'zh-CN',
    ja: 'ja-JP'
  }[localeName]

  currentLocale = createIntl({ locale, messages }, cache)
}

export function getCurrentLocale() {
  return currentLocale
}

export function t(id: string, values?: any) {
  return currentLocale.formatMessage({ id }, values)
}

export const T = FormattedMessage

export function mergeTranslations<T extends { [key: string]: T | string }>(
  target: T = {} as T,
  ...sources: (T | undefined)[]
) {
  return [target, ...sources].reduce<T>(
    (result, obj) => _mergeTranslations<T>(result, obj),
    {} as T
  )
}

function _mergeTranslations<T extends { [key: string]: T | string }>(
  target: T = {} as T,
  source: T = {} as T
) {
  const merged: T = Object.keys(source).reduce((result: T, key: string) => {
    // @ts-ignore
    result[key] =
      typeof source[key] === 'object'
        ? _mergeTranslations(target[key] as T, source[key] as T)
        : source[key]
    return result
  }, target)
  return merged
}
