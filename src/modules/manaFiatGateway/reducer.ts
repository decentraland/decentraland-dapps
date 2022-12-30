import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  SetPurchaseAction,
  SET_PURCHASE,
  UnsetPurchaseAction,
  UNSET_PURCHASE
} from '../mana/actions'
import { Purchase } from '../mana/types'
import {
  ManaFiatGatewayPurchaseCompletedFailureAction,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE,
  OpenBuyManaWithFiatModalFailureAction,
  OpenBuyManaWithFiatModalRequestAction,
  OpenBuyManaWithFiatModalSuccessAction,
  OpenManaFiatGatewayFailureAction,
  OpenManaFiatGatewayRequestAction,
  OpenManaFiatGatewaySuccessAction,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS,
  OPEN_MANA_FIAT_GATEWAY_FAILURE,
  OPEN_MANA_FIAT_GATEWAY_REQUEST,
  OPEN_MANA_FIAT_GATEWAY_SUCCESS
} from './actions'

export type ManaFiatGatewayState = {
  data: {
    purchases: Purchase[]
  }
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ManaFiatGatewayState = {
  data: { purchases: [] },
  loading: [],
  error: null
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
  | UnsetPurchaseAction

export function manaFiatGatewayReducer(
  state: ManaFiatGatewayState = INITIAL_STATE,
  action: ManaFiatGatewayReducerAction
): ManaFiatGatewayState {
  switch (action.type) {
    case OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }
    case OPEN_MANA_FIAT_GATEWAY_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case OPEN_MANA_FIAT_GATEWAY_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case OPEN_MANA_FIAT_GATEWAY_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }
    case MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
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
              _purchase => _purchase.id !== purchase.id
            ),
            purchase
          ]
        }
      }
    }
    case UNSET_PURCHASE: {
      const { purchase } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          purchases: [
            ...state.data.purchases.filter(
              _purchase => _purchase.id !== purchase.id
            )
          ]
        }
      }
    }
    default:
      return state
  }
}
