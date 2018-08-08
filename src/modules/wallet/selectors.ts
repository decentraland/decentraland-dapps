import { AnyAction } from 'redux'
import { BaseWallet } from './types'
import { WalletState } from './reducer'
import { CONNECT_WALLET_REQUEST } from './actions'
import { isLoadingType } from '../loading/selectors'

export const getState = (state: any): WalletState => state.wallet
export const getData = (state: any): Partial<BaseWallet> => getState(state).data
export const getLoading = (state: any): AnyAction[] => getState(state).loading
export const getError = (state: any) => getState(state).error
export const getNetwork = (state: any) => getData(state).network
export const getAddress = (state: any) => getData(state).address
export const getLocale = (state: any) => getData(state).locale
export const isConnected = (state: any) => !!getData(state).address
export const isConnecting = (state: any) =>
  isLoadingType(getLoading(state), CONNECT_WALLET_REQUEST)
