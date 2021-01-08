import { action } from 'typesafe-actions'
import { ProviderType } from 'decentraland-connect'
import { Wallet } from './types'

export const CONNECT_WALLET_REQUEST = '[Request] Connect Wallet'
export const CONNECT_WALLET_SUCCESS = '[Success] Connect Wallet'
export const CONNECT_WALLET_FAILURE = '[Failure] Connect Wallet'

export const connectWalletRequest = () => action(CONNECT_WALLET_REQUEST)
export const connectWalletSuccess = (wallet: Wallet) =>
  action(CONNECT_WALLET_SUCCESS, { wallet })
export const connectWalletFailure = (error: string) =>
  action(CONNECT_WALLET_FAILURE, { error })

export type ConnectWalletRequestAction = ReturnType<typeof connectWalletRequest>
export type ConnectWalletSuccessAction = ReturnType<typeof connectWalletSuccess>
export type ConnectWalletFailureAction = ReturnType<typeof connectWalletFailure>

export const ENABLE_WALLET_REQUEST = '[Request] Enable Wallet'
export const ENABLE_WALLET_SUCCESS = '[Success] Enable Wallet'
export const ENABLE_WALLET_FAILURE = '[Failure] Enable Wallet'

export const enableWalletRequest = (providerType: ProviderType) =>
  action(ENABLE_WALLET_REQUEST, { providerType })
export const enableWalletSuccess = (providerType: ProviderType) =>
  action(ENABLE_WALLET_SUCCESS, { providerType })
export const enableWalletFailure = (error: string) =>
  action(ENABLE_WALLET_FAILURE, { error })

export type EnableWalletRequestAction = ReturnType<typeof enableWalletRequest>
export type EnableWalletSuccessAction = ReturnType<typeof enableWalletSuccess>
export type EnableWalletFailureAction = ReturnType<typeof enableWalletFailure>

export const CHANGE_ACCOUNT = 'Change Account'
export const changeAccount = (wallet: Wallet) =>
  action(CHANGE_ACCOUNT, { wallet })
export type ChangeAccountAction = ReturnType<typeof changeAccount>

export const CHANGE_NETWORK = 'Change Network'
export const changeNetwork = (wallet: Wallet) =>
  action(CHANGE_NETWORK, { wallet })
export type ChangeNetworkAction = ReturnType<typeof changeNetwork>

export const DISCONNECT_WALLET = 'Disconnect'
export const disconnectWallet = () => action(DISCONNECT_WALLET)
export type DisconnectWalletAction = ReturnType<typeof disconnectWallet>
