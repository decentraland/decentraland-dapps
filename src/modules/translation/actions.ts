import { action } from 'typesafe-actions'
import {
  FETCH_TRANSLATIONS_REQUEST,
  FETCH_TRANSLATIONS_SUCCESS,
  FETCH_TRANSLATIONS_FAILURE,
  CHANGE_LOCALE,
  TranslationKeys
} from './types'

// Fetch translations

export const fetchTranslationsRequest = (locale: string) =>
  action(FETCH_TRANSLATIONS_REQUEST, { locale })

export const fetchTranslationsSuccess = (
  locale: string,
  translations: TranslationKeys
) => action(FETCH_TRANSLATIONS_SUCCESS, { locale, translations })

export const fetchTranslationsFailure = (error: string) =>
  action(FETCH_TRANSLATIONS_FAILURE, { error })

// Change locale

export const changeLocale = (locale: string) =>
  action(CHANGE_LOCALE, { locale })
