import * as dateFnsFormat from 'date-fns/format'
import * as dateFnsDistanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { Model, ModelById, DataByKey } from './types'
import { getCurrentLocale } from '../modules/translation/utils'

export function isMobile() {
  // WARN: Super naive mobile device check.
  // we're using it on low-stake checks, where failing to detect some browsers is not a big deal.
  // If you need more specificity you may want to change this implementation.
  const navigator = window.navigator

  return (
    /Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)
  )
}

export function toObjectById<T extends Model>(
  values: T[],
  currentValues: ModelById<T> = {}
): ModelById<T> {
  return toObjectByKey<T>(values, currentValues, 'id')
}

export function toObjectByKey<T extends Object>(
  values: T[],
  currentValues: DataByKey<T> = {},
  key: keyof T
): DataByKey<T> {
  return values.reduce(
    (valueHash, value) => ({
      ...valueHash,
      [value[key].toString()]: value
    }),
    currentValues
  )
}

export function distanceInWordsToNow(date: number | string, addSuffix = true) {
  return dateFnsDistanceInWordsToNow(date, {
    addSuffix,
    locale: getCurrentLocale()
  })
}

export function formatDate(date: number | string, format = 'MMMM Do, YYYY') {
  return dateFnsFormat(date, format, {
    locale: getCurrentLocale()
  })
}

export function formatDateTime(
  date: number | string,
  format = 'MMMM Do, YYYY - hh:mm aa'
) {
  return dateFnsFormat(date, format, {
    locale: getCurrentLocale()
  })
}

export function formatNumber(amount: number = 0, digits: number = 2) {
  return parseFloat((+amount).toFixed(digits)).toLocaleString()
}

/**
 * Merges deeply all the properties from one or more source objects into a target object. It will return a new object.
 * @param {object} target The target object
 * @param {...object} sources The source object(s)
 */
export function merge<T extends Object>(
  target: T = {} as T,
  ...sources: (T | undefined)[]
) {
  return [target, ...sources].reduce<T>(
    (result, obj) => _merge<T>(result, obj),
    {} as T
  )
}

function _merge<T extends Object>(target: T = {} as T, source: T = {} as T) {
  const merged: T = Object.keys(source).reduce((result: T, key: string) => {
    result[key] =
      typeof source[key] === 'object'
        ? _merge(target[key], source[key])
        : source[key]
    return result
  }, target)
  return merged
}
