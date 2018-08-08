import { action } from 'typesafe-actions'
import { TranslationKeys } from './types'

// Fetch translations

export const FETCH_TRANSLATIONS_REQUEST = '[Request] Fetch Translations'
export const FETCH_TRANSLATIONS_SUCCESS = '[Success] Fetch Translations'
export const FETCH_TRANSLATIONS_FAILURE = '[Failure] Fetch Translations'

export const fetchTranslationsRequest = (locale: string) =>
  action(FETCH_TRANSLATIONS_REQUEST, { locale })
export const fetchTranslationsSuccess = (
  locale: string,
  translations: TranslationKeys
) => action(FETCH_TRANSLATIONS_SUCCESS, { locale, translations })
export const fetchTranslationsFailure = (error: string) =>
  action(FETCH_TRANSLATIONS_FAILURE, { error })

export type FetchTranslationsRequestAction = ReturnType<
  typeof fetchTranslationsRequest
>
export type FetchTranslationsSuccessAction = ReturnType<
  typeof fetchTranslationsSuccess
>
export type FetchTranslationsFailureAction = ReturnType<
  typeof fetchTranslationsFailure
>

// Change locale

export const CHANGE_LOCALE = 'Change locale'

export const changeLocale = (locale: string) =>
  action(CHANGE_LOCALE, { locale })

export type ChangeLocaleAction = ReturnType<typeof changeLocale>
