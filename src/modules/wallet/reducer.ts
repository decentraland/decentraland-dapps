import { BaseWallet } from './types'
import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  ConnectWalletRequestAction,
  ConnectWalletSuccessAction,
  ConnectWalletFailureAction,
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  CONNECT_WALLET_FAILURE
} from './actions'
import {
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_SUCCESS,
  ChangeLocaleAction,
  FetchTranslationsSuccessAction
} from '../translation/actions'

export type WalletState = {
  data: Partial<BaseWallet>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: WalletState = {
  data: {},
  loading: [],
  error: null
}

export type WalletReducerAction =
  | ConnectWalletRequestAction
  | ConnectWalletSuccessAction
  | ConnectWalletFailureAction
  | ChangeLocaleAction
  | FetchTranslationsSuccessAction

export function walletReducer(
  state: WalletState = INITIAL_STATE,
  action: WalletReducerAction
): WalletState {
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
