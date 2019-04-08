import {
  IntlProvider,
  addLocaleData,
  InjectedIntl,
  FormattedMessage
} from 'react-intl'

import { Locale } from 'decentraland-ui'

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

export function setI18n(intl: InjectedIntl) {
  i18n = intl
}

export function setCurrentLocale(localeName: Locale) {
  currentLocale = {
    en: enFnsData,
    es: esFnsData,
    fr: frFnsData,
    ko: koFnsData,
    zh: zhFnsData,
    ja: jaFnsData
  }[localeName]
}

export function getCurrentLocale() {
  return currentLocale
}

export function t(id: string, values?: any) {
  return i18n.formatMessage({ id }, values)
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
    result[key] =
      typeof source[key] === 'object'
        ? _mergeTranslations(target[key] as T, source[key] as T)
        : source[key]
    return result
  }, target)
  return merged
}
