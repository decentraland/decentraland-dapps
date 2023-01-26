import type { Web3Provider } from '@ethersproject/providers/lib/web3-provider'
import type { Dispatch } from 'redux'
import type { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import type {
  connectWalletRequest,
  ConnectWalletRequestAction,
  changeAccount,
  changeNetwork,
  ChangeAccountAction,
  ChangeNetworkAction
} from '../../modules/wallet/actions'

export type Props = {
  address?: string
  chainId?: ChainId
  appChainId: ChainId
  isConnected: boolean
  isConnecting: boolean
  children: React.ReactNode
  onConnect: typeof connectWalletRequest
  onChangeAccount: typeof changeAccount
  onChangeNetwork: typeof changeNetwork
}

export type MapStateProps = Pick<
  Props,
  'address' | 'chainId' | 'appChainId' | 'isConnected' | 'isConnecting'
>
export type MapDispatchProps = Pick<
  Props,
  'address' | 'chainId' | 'onConnect' | 'onChangeAccount' | 'onChangeNetwork'
>
export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | ChangeAccountAction | ChangeNetworkAction
>

export type EventType = 'accountsChanged' | 'chainChanged' | 'networkChanged'
export type EmitterMethod = 'on' | 'removeListener'
export type AccountsChangedHandler = (accounts: string[]) => void
export type NetworkChangedHandler = (chainId: string) => void
export type Handler = AccountsChangedHandler | NetworkChangedHandler
export type ProviderWindow = Window & {
  ethereum?: Web3Provider
}
