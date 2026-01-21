import dateFnsDistanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import dateFnsFormat from 'date-fns/format'
import { Env, getEnv } from '@dcl/ui-env'
import { getCurrentLocale } from '../modules/translation/utils'
import { DataByKey, Model, ModelById } from './types'

export function isMobile() {
  // WARN: Super naive mobile device check.
  // we're using it on low-stake checks, where failing to detect some browsers is not a big deal.
  // If you need more specificity you may want to change this implementation.
  const navigator = window.navigator

  return (
    !!navigator &&
    (/Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent))
  )
}

export function insertScript({
  type = 'text/javascript',
  async = true,
  ...props
}) {
  const script = document.createElement('script')
  Object.assign(script, { type, async: async, ...props }) // WARN: babel breaks on `{ async }`

  document.body.appendChild(script)

  return script
}

export function toObjectById<T extends Model>(
  values: T[],
  currentValues: ModelById<T> = {},
): ModelById<T> {
  return toObjectByKey<T>(values, currentValues, 'id')
}

export function toObjectByKey<T extends object>(
  values: T[],
  currentValues: DataByKey<T> = {},
  key: keyof T,
): DataByKey<T> {
  return values.reduce<DataByKey<T>>(
    (obj, value) => {
      obj[value[key] as any] = value
      return obj
    },
    { ...currentValues },
  )
}

export function distanceInWordsToNow(date: number | string, addSuffix = true) {
  return dateFnsDistanceInWordsToNow(date, {
    addSuffix,
    locale: getCurrentLocale(),
  })
}

export function formatDate(date: number | string, format = 'MMMM Do, YYYY') {
  return dateFnsFormat(date, format, {
    locale: getCurrentLocale(),
  })
}

export function formatDateTime(
  date: number | string,
  format = 'MMMM Do, YYYY - hh:mm aa',
) {
  return dateFnsFormat(date, format, {
    locale: getCurrentLocale(),
  })
}

export function formatNumber(amount: number = 0, digits: number = 2) {
  return parseFloat((+amount).toFixed(digits)).toLocaleString()
}

export function getBaseUrl() {
  const env = getEnv()
  if (env === Env.DEVELOPMENT) {
    return 'https://decentraland.zone'
  } else if (env === Env.STAGING) {
    return 'https://decentraland.today'
  } else {
    return 'https://decentraland.org'
  }
}
