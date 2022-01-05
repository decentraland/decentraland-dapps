import { Network } from '@dcl/schemas/dist/dapps/network'
import { isLoadingType } from '../loading/selectors'
import { CONNECT_WALLET_REQUEST, ENABLE_WALLET_REQUEST } from './actions'
import { WalletState } from './reducer'

export const getState: (state: any) => WalletState = state => state.wallet
export const getData = (state: any) => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const getError = (state: any) => getState(state).error

export const isConnected = (state: any) => getData(state) !== null
export const isConnecting = (state: any) =>
  isLoadingType(getLoading(state), CONNECT_WALLET_REQUEST)
export const isEnabling = (state: any) =>
  isLoadingType(getLoading(state), ENABLE_WALLET_REQUEST)

export const getAddress = (state: any) =>
  isConnected(state) ? getData(state)!.address : undefined

export const getChainId = (state: any) =>
  isConnected(state) ? getData(state)!.chainId : undefined

export const getProviderType = (state: any) =>
  isConnected(state) ? getData(state)!.providerType : undefined

export const getNetwork = (state: any) =>
  isConnected(state) ? getData(state)!.network : undefined

export const getNetworks = (state: any) =>
  isConnected(state) ? getData(state)!.networks : undefined

export const hasAcceptedNetworkPartialSupport = (state: any) =>
  getState(state).hasAcceptedNetworkPartialSupport

/**
 * @deprecated This method is deprecated, it only returns the MANA balance on Ethereum, use getNetworks() to get the MANA balances on all the networks.
 */
export const getMana = (state: any) => {
  if (!isConnected(state)) {
    return undefined
  }
  const networks = getNetworks(state)!
  return networks[Network.ETHEREUM].mana
}
