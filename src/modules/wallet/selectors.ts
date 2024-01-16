import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { isLoadingType } from '../loading/selectors'
import { Props as UserMenuProps } from '../../containers/UserMenu/UserMenu.types'
import {
  CONNECT_WALLET_REQUEST,
  ENABLE_WALLET_REQUEST,
  SWITCH_NETWORK_REQUEST
} from './actions'
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

export const isSwitchingNetwork = (state: any) =>
  isLoadingType(getLoading(state), SWITCH_NETWORK_REQUEST)

// Casting as ChainId since it will be initialized at the beginning
export const getAppChainId = (state: any) =>
  getState(state).appChainId as ChainId

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

export const getManaBalances = (state: any) => {
  if (!isConnected(state)) {
    return undefined
  }

  const manaBalances: UserMenuProps['manaBalances'] = {}
  const networkList = Object.values(Network) as Network[]
  const networks = getNetworks(state)!
  for (const network of networkList) {
    const networkData = networks[network]
    if (networkData) {
      manaBalances[network] = networks[network].mana
    }
  }

  return manaBalances
}
