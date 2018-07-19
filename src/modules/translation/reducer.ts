import {
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_REQUEST,
  FETCH_TRANSLATIONS_SUCCESS,
  FETCH_TRANSLATIONS_FAILURE,
  TranslationState,
  TranslationActions
} from './types'
import { loadingReducer } from '../loading/reducer'

export const INITIAL_STATE: TranslationState = {
  data: {},
  loading: [],
  error: null
}

export function translationReducer(
  state = INITIAL_STATE,
  action: TranslationActions
): TranslationState {
  switch (action.type) {
    case CHANGE_LOCALE:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [action.payload.locale]: null
        }
      }
    case FETCH_TRANSLATIONS_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    case FETCH_TRANSLATIONS_SUCCESS:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
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
