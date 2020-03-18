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
