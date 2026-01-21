import { ChainId } from "@dcl/schemas/dist/dapps/chain-id";
import { LoadingState, loadingReducer } from "../loading/reducer";
import {
  CHANGE_ACCOUNT,
  CHANGE_NETWORK,
  CONNECT_WALLET_FAILURE,
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  ChangeAccountAction,
  ChangeNetworkAction,
  ConnectWalletFailureAction,
  ConnectWalletRequestAction,
  ConnectWalletSuccessAction,
  DISCONNECT_WALLET_FAILURE,
  DISCONNECT_WALLET_REQUEST,
  DISCONNECT_WALLET_SUCCESS,
  DisconnectWalletFailureAction,
  DisconnectWalletRequestAction,
  DisconnectWalletSuccessAction,
  ENABLE_WALLET_FAILURE,
  ENABLE_WALLET_REQUEST,
  ENABLE_WALLET_SUCCESS,
  EnableWalletFailureAction,
  EnableWalletRequestAction,
  EnableWalletSuccessAction,
  FETCH_WALLET_FAILURE,
  FETCH_WALLET_REQUEST,
  FETCH_WALLET_SUCCESS,
  FetchWalletFailureAction,
  FetchWalletRequestAction,
  FetchWalletSuccessAction,
  SET_APP_CHAIN_ID,
  SWITCH_NETWORK_FAILURE,
  SWITCH_NETWORK_REQUEST,
  SWITCH_NETWORK_SUCCESS,
  SetAppChainIdAction,
  SwitchNetworkFailureAction,
  SwitchNetworkRequestAction,
  SwitchNetworkSuccessAction,
} from "./actions";
import { Wallet } from "./types";

export type WalletState = {
  data: Wallet | null;
  loading: LoadingState;
  error: string | null;
  appChainId: ChainId | null;
};

export const INITIAL_STATE: WalletState = {
  data: null,
  loading: [],
  error: null,
  appChainId: null,
};

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
  | SetAppChainIdAction;

export function walletReducer(
  state: WalletState = INITIAL_STATE,
  action: WalletReducerAction,
): WalletState {
  switch (action.type) {
    case FETCH_WALLET_REQUEST:
    case ENABLE_WALLET_REQUEST:
    case DISCONNECT_WALLET_REQUEST:
    case CONNECT_WALLET_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      };
    }

    case SWITCH_NETWORK_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      };
    }

    case FETCH_WALLET_SUCCESS:
    case CONNECT_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: action.payload.wallet,
      };
    }

    case SWITCH_NETWORK_SUCCESS:
    case ENABLE_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      };
    }

    case DISCONNECT_WALLET_FAILURE:
    case FETCH_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      };
    }

    case SWITCH_NETWORK_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
        loading: loadingReducer(state.loading, action),
      };
    }

    case CONNECT_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: null,
      };
    }

    case ENABLE_WALLET_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
        data: null,
      };
    }

    case CHANGE_ACCOUNT:
    case CHANGE_NETWORK: {
      return {
        ...state,
        error: null,
        data: action.payload.wallet,
      };
    }

    case DISCONNECT_WALLET_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: null,
      };
    }

    case SET_APP_CHAIN_ID: {
      return {
        ...state,
        appChainId: action.payload.chainId,
      };
    }

    default:
      return state;
  }
}
