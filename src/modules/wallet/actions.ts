import { action } from 'typesafe-actions'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
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

export const FETCH_WALLET_REQUEST = '[Request] Fetch Wallet'
export const FETCH_WALLET_SUCCESS = '[Success] Fetch Wallet'
export const FETCH_WALLET_FAILURE = '[Failure] Fetch Wallet'

export const fetchWalletRequest = () => action(FETCH_WALLET_REQUEST)
export const fetchWalletSuccess = (wallet: Wallet) =>
  action(FETCH_WALLET_SUCCESS, { wallet })
export const fetchWalletFailure = (error: string) =>
  action(FETCH_WALLET_FAILURE, { error })

export type FetchWalletRequestAction = ReturnType<typeof fetchWalletRequest>
export type FetchWalletSuccessAction = ReturnType<typeof fetchWalletSuccess>
export type FetchWalletFailureAction = ReturnType<typeof fetchWalletFailure>

export const SWITCH_NETWORK_REQUEST = '[Request] Switch Network'
export const SWITCH_NETWORK_SUCCESS = '[Success] Switch Network'
export const SWITCH_NETWORK_FAILURE = '[Failure] Switch Network'

export const switchNetworkRequest = (chainId: ChainId) =>
  action(SWITCH_NETWORK_REQUEST, { chainId })
export const switchNetworkSuccess = (chainId: ChainId) =>
  action(SWITCH_NETWORK_SUCCESS, { chainId })
export const switchNetworkFailure = (chainId: ChainId, error: string) =>
  action(SWITCH_NETWORK_FAILURE, { chainId, error })

export type SwitchNetworkRequestAction = ReturnType<typeof switchNetworkRequest>
export type SwitchNetworkSuccessAction = ReturnType<typeof switchNetworkSuccess>
export type SwitchNetworkFailureAction = ReturnType<typeof switchNetworkFailure>

export const ACCEPT_NETWORK_PARTIAL_SUPPORT = 'Accept network partial support'
export const acceptNetworkPartialSupport = () =>
  action(ACCEPT_NETWORK_PARTIAL_SUPPORT)
export type AcceptNetworkPartialSupportAction = ReturnType<
  typeof acceptNetworkPartialSupport
>
