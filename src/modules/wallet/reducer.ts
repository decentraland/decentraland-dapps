import { loadingReducer, LoadingState } from '../loading/reducer'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
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
  ENABLE_WALLET_FAILURE,
  FETCH_WALLET_REQUEST,
  FetchWalletRequestAction,
  FetchWalletSuccessAction,
  FetchWalletFailureAction,
  FETCH_WALLET_SUCCESS,
  FETCH_WALLET_FAILURE,
  SetAppChainIdAction,
  SET_APP_CHAIN_ID
} from './actions'

export type WalletState = {
  data: Wallet | null
  loading: LoadingState
  error: string | null
  appChainId: ChainId | null
}

export const INITIAL_STATE: WalletState = {
  data: null,
  loading: [],
  error: null,
  appChainId: null
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
  | FetchWalletRequestAction
  | FetchWalletSuccessAction
  | FetchWalletFailureAction
  | SetAppChainIdAction

export function walletReducer(
  state: WalletState = INITIAL_STATE,
  action: WalletReducerAction
): WalletState {
  switch (action.type) {
    case FETCH_WALLET_REQUEST:
    case ENABLE_WALLET_REQUEST:
    case CONNECT_WALLET_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case FETCH_WALLET_SUCCESS:
    case CONNECT_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: action.payload.wallet
      }
    }

    case ENABLE_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    case FETCH_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case CONNECT_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: null
      }
    }

    case ENABLE_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
        data: null
      }
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
        error: null,
        data: null
      }
    }

    case SET_APP_CHAIN_ID: {
      return {
        ...state,
        appChainId: action.payload.chainId
      }
    }

    default:
      return state
  }
}
