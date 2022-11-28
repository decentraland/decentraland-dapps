import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  ManaFiatGatewayPurchaseCompletedFailureAction,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE,
  SetWidgetSrcAction,
  SET_WIDGET_URL
} from './actions'

export type ManaFiatGatewayState = {
  data: { widgetUrl: string } | null
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ManaFiatGatewayState = {
  data: null,
  loading: [],
  error: null
}

export type ManaFiatGatewayReducerAction =
  | SetWidgetSrcAction
  | ManaFiatGatewayPurchaseCompletedFailureAction

export function manaFiatGatewayReducer(
  state: ManaFiatGatewayState = INITIAL_STATE,
  action: ManaFiatGatewayReducerAction
): ManaFiatGatewayState {
  switch (action.type) {
    case SET_WIDGET_URL: {
      return {
        ...state,
        data: action.payload,
        loading: loadingReducer(state.loading, action)
      }
    }
    case MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    default:
      return state
  }
}