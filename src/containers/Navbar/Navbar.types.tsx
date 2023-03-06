import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar/Navbar'
import {
  disconnectWallet,
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'

export type NavbarProps = NavbarComponentProps & {
  chainId?: ChainId
  appChainId: ChainId
  hasTranslations?: boolean
  docsUrl?: string
  onSwitchNetwork: typeof switchNetworkRequest
  onSignOut: typeof disconnectWallet
}

export type MapStateProps = Pick<
  NavbarProps,
  | 'mana'
  | 'address'
  | 'isConnected'
  | 'isConnecting'
  | 'hasTranslations'
  | 'chainId'
  | 'appChainId'
>

export type MapDispatchProps = Pick<
  NavbarProps,
  'onSwitchNetwork' | 'onSignOut'
>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
