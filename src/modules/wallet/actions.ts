import { action } from 'typesafe-actions'
import { BaseWallet } from './types'

export const CONNECT_WALLET_REQUEST = '[Request] Connect Wallet'
export const CONNECT_WALLET_SUCCESS = '[Success] Connect Wallet'
export const CONNECT_WALLET_FAILURE = '[Failure] Connect Wallet'

export const connectWalletRequest = () => action(CONNECT_WALLET_REQUEST, {})
export const connectWalletSuccess = (wallet: BaseWallet) =>
  action(CONNECT_WALLET_SUCCESS, { wallet })
export const connectWalletFailure = (error: string) =>
  action(CONNECT_WALLET_FAILURE, { error })

export type ConnectWalletRequestAction = ReturnType<typeof connectWalletRequest>
export type ConnectWalletSuccessAction = ReturnType<typeof connectWalletSuccess>
export type ConnectWalletFailureAction = ReturnType<typeof connectWalletFailure>
