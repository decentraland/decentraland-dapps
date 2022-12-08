import { isLoadingType } from '../loading/selectors'
import { MANA_FIAT_GATEWAY_PURCHASE_COMPLETED } from './actions'
import { ManaFiatGatewayState } from './reducer'

export const getState: (state: any) => ManaFiatGatewayState = state =>
  state.manaFiatGateway

export const getData = (state: any) => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const getError = (state: any) => getState(state).error

export const isFinishingPurchase = (state: any) =>
  isLoadingType(getLoading(state), MANA_FIAT_GATEWAY_PURCHASE_COMPLETED)
