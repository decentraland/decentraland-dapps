import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar/Navbar'
import {
  acceptNetworkPartialSupport,
  AcceptNetworkPartialSupportAction,
  disconnectWallet,
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'

export type NavbarProps = NavbarComponentProps & {
  chainId?: ChainId
  hasTranslations?: boolean
  onSwitchNetwork: typeof switchNetworkRequest
  onSignOut: typeof disconnectWallet
  hasAcceptedNetworkPartialSupport: boolean
  onAcceptNetworkPartialSupport: typeof acceptNetworkPartialSupport
}

export type MapStateProps = Pick<
  NavbarProps,
  | 'mana'
  | 'address'
  | 'isConnected'
  | 'isConnecting'
  | 'hasTranslations'
  | 'chainId'
  | 'hasAcceptedNetworkPartialSupport'
>

export type MapDispatchProps = Pick<
  NavbarProps,
  'onSwitchNetwork' | 'onSignOut' | 'onAcceptNetworkPartialSupport'
>
export type MapDispatch = Dispatch<
  SwitchNetworkRequestAction | AcceptNetworkPartialSupportAction
>
