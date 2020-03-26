import { loadingReducer, LoadingState } from '../loading/reducer'

import { Wallet } from './types'
import {
  ConnectWalletRequestAction,
  ConnectWalletSuccessAction,
  ConnectWalletFailureAction,
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  CONNECT_WALLET_FAILURE,
  DisconnectWalletAction,
  DISCONNECT_WALLET,
  ChangeAccountAction,
  ChangeNetworkAction,
  CHANGE_ACCOUNT,
  CHANGE_NETWORK,
  EnableWalletRequestAction,
  EnableWalletSuccessAction,
  EnableWalletFailureAction,
  ENABLE_WALLET_REQUEST,
  ENABLE_WALLET_SUCCESS,
  ENABLE_WALLET_FAILURE
} from './actions'

export type WalletState = {
  data: Wallet | null
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: WalletState = {
  data: null,
  loading: [],
  error: null
}

export type WalletReducerAction =
  | ConnectWalletRequestAction
  | ConnectWalletSuccessAction
  | ConnectWalletFailureAction
  | EnableWalletRequestAction
  | EnableWalletSuccessAction
  | EnableWalletFailureAction
  | DisconnectWalletAction
  | ChangeAccountAction
  | ChangeNetworkAction

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
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: action.payload.wallet
      }
    case CONNECT_WALLET_FAILURE:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    case ENABLE_WALLET_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    case ENABLE_WALLET_SUCCESS:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    case ENABLE_WALLET_FAILURE:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    case CHANGE_ACCOUNT:
    case CHANGE_NETWORK: {
      return {
        ...state,
        error: null,
        data: action.payload.wallet
      }
    }
    case DISCONNECT_WALLET: {
      return {
        ...state,
        data: null
      }
    }
    default:
      return state
  }
}
