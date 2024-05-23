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
  SET_APP_CHAIN_ID,
  SWITCH_NETWORK_REQUEST,
  SwitchNetworkRequestAction,
  SwitchNetworkSuccessAction,
  SwitchNetworkFailureAction,
  SWITCH_NETWORK_SUCCESS,
  SWITCH_NETWORK_FAILURE,
  DISCONNECT_WALLET_SUCCESS,
  DISCONNECT_WALLET_REQUEST,
  DisconnectWalletSuccessAction,
  DisconnectWalletFailureAction,
  DisconnectWalletRequestAction,
  DISCONNECT_WALLET_FAILURE
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
  | SwitchNetworkRequestAction
  | SwitchNetworkSuccessAction
  | SwitchNetworkFailureAction
  | EnableWalletRequestAction
  | EnableWalletSuccessAction
  | EnableWalletFailureAction
  | DisconnectWalletRequestAction
  | DisconnectWalletSuccessAction
  | DisconnectWalletFailureAction
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
    case DISCONNECT_WALLET_REQUEST:
    case CONNECT_WALLET_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case SWITCH_NETWORK_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
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

    case SWITCH_NETWORK_SUCCESS:
    case ENABLE_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    case DISCONNECT_WALLET_FAILURE:
    case FETCH_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case SWITCH_NETWORK_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
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

    case DISCONNECT_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
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
