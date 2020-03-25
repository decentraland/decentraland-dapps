import { EthereumProvider } from 'web3x-es/providers/ethereum-provider'
import { Dispatch } from 'redux'
import {
  connectWalletRequest,
  ConnectWalletRequestAction,
  changeAccount,
  changeNetwork,
  ChangeAccountAction,
  ChangeNetworkAction
} from '../../modules/wallet/actions'

export type Props = {
  address?: string
  network?: number
  children: React.ReactNode | null
  onConnect: typeof connectWalletRequest
  onChangeAccount: typeof changeAccount
  onChangeNetwork: typeof changeNetwork
}

export type MapStateProps = Pick<Props, 'address' | 'network'>
export type MapDispatchProps = Pick<
  Props,
  'address' | 'network' | 'onConnect' | 'onChangeAccount' | 'onChangeNetwork'
>
export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | ChangeAccountAction | ChangeNetworkAction
>

export type EventType = 'accountsChanged' | 'networkChanged'
export type EmitterMethod = 'on' | 'removeListener'
export type AccountsChangedHandler = (accounts: string[]) => void
export type NetworkChangedHandler = (network: string) => void
export type Handler = AccountsChangedHandler | NetworkChangedHandler
export type ProviderWindow = Window & { ethereum?: EthereumProvider }
