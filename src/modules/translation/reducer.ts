import { Locale } from 'decentraland-ui'

import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  ChangeLocaleAction,
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_REQUEST,
  FETCH_TRANSLATIONS_SUCCESS,
  FETCH_TRANSLATIONS_FAILURE,
  FetchTranslationsRequestAction,
  FetchTranslationsSuccessAction,
  FetchTranslationsFailureAction
} from './actions'
import { Translation } from './types'

export type TranslationState = {
  data: Translation
  locale: Locale
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: TranslationState = {
  data: {},
  locale: 'en',
  loading: [],
  error: null
}

export type TranslationReducerAction =
  | ChangeLocaleAction
  | FetchTranslationsRequestAction
  | FetchTranslationsSuccessAction
  | FetchTranslationsFailureAction

export function translationReducer(
  state = INITIAL_STATE,
  action: TranslationReducerAction
): TranslationState {
  switch (action.type) {
    case CHANGE_LOCALE:
      return {
        ...state,
        locale: action.payload.locale
      }
    case FETCH_TRANSLATIONS_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [action.payload.locale]: null
        }
      }
    case FETCH_TRANSLATIONS_SUCCESS:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        locale: action.payload.locale,
        data: {
          ...state.data,
          [action.payload.locale]: {
            ...action.payload.translations
          }
        }
      }
    case FETCH_TRANSLATIONS_FAILURE:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    default:
      return state
  }
}
