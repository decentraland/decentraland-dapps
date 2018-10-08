import {
  IntlProvider,
  addLocaleData,
  InjectedIntl,
  FormattedMessage
} from 'react-intl'

import * as enIntlData from 'react-intl/locale-data/en'
import * as esIntlData from 'react-intl/locale-data/es'
import * as frIntlData from 'react-intl/locale-data/fr'
import * as koIntlData from 'react-intl/locale-data/ko'
import * as zhIntlData from 'react-intl/locale-data/zh'
import * as jaIntlData from 'react-intl/locale-data/ja'

// We use require here to make ts-loader happy
const enFnsData = require('date-fns/locale/en')
const esFnsData = require('date-fns/locale/es')
const frFnsData = require('date-fns/locale/fr')
const koFnsData = require('date-fns/locale/ko')
const zhFnsData = require('date-fns/locale/zh_cn')
const jaFnsData = require('date-fns/locale/ja')

const DEFAULT_LOCALE = 'en'

// cache
let i18n: InjectedIntl
let currentLocale: typeof enFnsData

export const I18nProvider = IntlProvider

export function addAvailableLocaleData(): void {
  addLocaleData(
    Array.prototype.concat(
      enIntlData,
      esIntlData,
      frIntlData,
      koIntlData,
      zhIntlData,
      jaIntlData
    )
  )
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
    es: esFnsData,
    fr: frFnsData,
    ko: koFnsData,
    zh: zhFnsData,
    ja: jaFnsData
  }[localeName || DEFAULT_LOCALE]
}

export function getCurrentLocale() {
  return currentLocale
}

export function t(id: string, values?: any) {
  return i18n.formatMessage({ id }, values)
}

export const T = FormattedMessage
