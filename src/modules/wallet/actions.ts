import { action } from 'typesafe-actions'
import {
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  CONNECT_WALLET_FAILURE,
  BaseWallet
} from './types'

export const connectWalletRequest = () => action(CONNECT_WALLET_REQUEST, {})
export const connectWalletSuccess = (wallet: BaseWallet) =>
  action(CONNECT_WALLET_SUCCESS, { wallet })
export const connectWalletFailure = (error: string) =>
  action(CONNECT_WALLET_FAILURE, { error })
