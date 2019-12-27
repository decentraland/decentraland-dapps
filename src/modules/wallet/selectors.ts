import { isLoadingType } from '../loading/selectors'

import { CONNECT_WALLET_REQUEST } from './actions'
import { WalletState } from './reducer'

export const getState: (state: any) => WalletState = state => state.wallet
export const getData = (state: any) => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const getError = (state: any) => getState(state).error

export const isConnected = (state: any) => getData(state) !== null
export const isConnecting = (state: any) =>
  isLoadingType(getLoading(state), CONNECT_WALLET_REQUEST)

export const getNetwork = (state: any) =>
  isConnected(state) ? getData(state)!.network : undefined
export const getAddress = (state: any) =>
  isConnected(state) ? getData(state)!.address : undefined
export const getMana = (state: any) =>
  isConnected(state) ? getData(state)!.mana : undefined
export const getEth = (state: any) =>
  isConnected(state) ? getData(state)!.eth : undefined
