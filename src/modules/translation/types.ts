import { ActionType } from 'typesafe-actions'
import { LoadingState } from '../loading/types'
import * as actions from '../translation/actions'

export const FETCH_TRANSLATIONS_REQUEST = '[Request] Fetch Translations'
export const FETCH_TRANSLATIONS_SUCCESS = '[Success] Fetch Translations'
export const FETCH_TRANSLATIONS_FAILURE = '[Failure] Fetch Translations'

export const CHANGE_LOCALE = 'Change locale'

// Interface and type definitions

export type FetchTranslationRequest = ReturnType<
  typeof actions.fetchTranslationsRequest
>

export type TranslationActions = ActionType<typeof actions>

export interface Translation {
  [locale: string]: TranslationKeys | null
}
export interface TranslationKeys {
  [key: string]: string
}

export type TranslationState = {
  data: Translation
  loading: LoadingState
  error: string | null
}
