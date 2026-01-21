import {
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE,
  ManaFiatGatewayPurchaseCompletedFailureAction,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS,
  OPEN_MANA_FIAT_GATEWAY_FAILURE,
  OPEN_MANA_FIAT_GATEWAY_REQUEST,
  OPEN_MANA_FIAT_GATEWAY_SUCCESS,
  OpenBuyManaWithFiatModalFailureAction,
  OpenBuyManaWithFiatModalRequestAction,
  OpenBuyManaWithFiatModalSuccessAction,
  OpenManaFiatGatewayFailureAction,
  OpenManaFiatGatewayRequestAction,
  OpenManaFiatGatewaySuccessAction,
  POLL_PURCHASE_STATUS_FAILURE,
  POLL_PURCHASE_STATUS_REQUEST,
  POLL_PURCHASE_STATUS_SUCCESS,
  PollPurchaseStatusFailureAction,
  PollPurchaseStatusRequestAction,
  PollPurchaseStatusSuccessAction,
  SET_PURCHASE,
  SetPurchaseAction,
} from '../gateway/actions'
import { LoadingState, loadingReducer } from '../loading/reducer'
import { Purchase } from './types'

export type GatewayState = {
  data: {
    purchases: Purchase[]
  }
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: GatewayState = {
  data: { purchases: [] },
  loading: [],
  error: null,
}

export type ManaFiatGatewayReducerAction =
  | OpenBuyManaWithFiatModalRequestAction
  | OpenBuyManaWithFiatModalSuccessAction
  | OpenBuyManaWithFiatModalFailureAction
  | OpenManaFiatGatewayRequestAction
  | OpenManaFiatGatewaySuccessAction
  | OpenManaFiatGatewayFailureAction
  | ManaFiatGatewayPurchaseCompletedFailureAction
  | SetPurchaseAction
  | PollPurchaseStatusRequestAction
  | PollPurchaseStatusSuccessAction
  | PollPurchaseStatusFailureAction

export function gatewayReducer(
  state: GatewayState = INITIAL_STATE,
  action: ManaFiatGatewayReducerAction,
): GatewayState {
  switch (action.type) {
    case OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      }
    }
    case OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      }
    }
    case OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error,
      }
    }
    case OPEN_MANA_FIAT_GATEWAY_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      }
    }
    case OPEN_MANA_FIAT_GATEWAY_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      }
    }
    case OPEN_MANA_FIAT_GATEWAY_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error,
      }
    }
    case MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
      }
    }
    case SET_PURCHASE: {
      const { purchase } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          purchases: [
            ...state.data.purchases.filter(
              (_purchase) => _purchase.id !== purchase.id,
            ),
            purchase,
          ],
        },
      }
    }
    case POLL_PURCHASE_STATUS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      }
    }
    case POLL_PURCHASE_STATUS_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
      }
    }
    case POLL_PURCHASE_STATUS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error,
      }
    }
    default:
      return state
  }
}
