import { IntlProvider, addLocaleData, InjectedIntl } from 'react-intl'

// Check the method: getAvailableLocales below to see which locales to add
// Then, you'll need to add it to: addAvailableLocaleData and setCurrentLocale
// This is annoying but better than bundling 200KB of locales
import * as enIntlData from 'react-intl/locale-data/en'
import * as esIntlData from 'react-intl/locale-data/es'

// We use require here to make ts-loader happy
const enFnsData = require('date-fns/locale/en')
const esFnsData = require('date-fns/locale/es')

const DEFAULT_LOCALE = 'en'

// cache
let i18n: InjectedIntl
let currentLocale: typeof enFnsData

export const I18nProvider = IntlProvider

export function addAvailableLocaleData(): void {
  addLocaleData(Array.prototype.concat(enIntlData, esIntlData))
}

export function getPreferredLocale(
  availableLocales: string[] = ['en']
): string {
  const navigator = window.navigator

  let locale =
    (navigator.languages && navigator.languages[0]) || navigator.language

  locale = locale.slice(0, 2)

  if (!availableLocales.includes(locale)) {
    locale = DEFAULT_LOCALE
  }

  return locale
}

export function setI18n(intl: InjectedIntl) {
  i18n = intl
}

export function setCurrentLocale(localeName: string) {
  currentLocale = {
    en: enFnsData,
    es: esFnsData
  }[localeName || DEFAULT_LOCALE]
}

export function getCurrentLocale() {
  return currentLocale
}

export function t(id: string, values?: any) {
  return i18n.formatMessage({ id }, values)
}
