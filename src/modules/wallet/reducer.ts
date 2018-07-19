import {
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  CONNECT_WALLET_FAILURE,
  WalletState,
  WalletActions
} from './types'
import {
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_SUCCESS,
  TranslationActions
} from '../translation/types'
import { loadingReducer } from '../loading/reducer'

export const INITIAL_STATE: WalletState = {
  data: {},
  loading: [],
  error: null
}

export function walletReducer(
  state = INITIAL_STATE,
  action: WalletActions | TranslationActions
) {
  switch (action.type) {
    case CONNECT_WALLET_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    case CONNECT_WALLET_SUCCESS:
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...action.payload.wallet
        }
      }
    case CONNECT_WALLET_FAILURE:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    case CHANGE_LOCALE:
    case FETCH_TRANSLATIONS_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          locale: action.payload.locale
        }
      }
    default:
      return state
  }
}
