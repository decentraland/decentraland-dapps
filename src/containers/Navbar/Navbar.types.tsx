import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui'
import {
  acceptNetworkPartialSupport,
  AcceptNetworkPartialSupportAction,
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'

export type NavbarProps = NavbarComponentProps & {
  chainId?: ChainId
  hasTranslations?: boolean
  onSwitchNetwork: typeof switchNetworkRequest
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
  'onSwitchNetwork' | 'onAcceptNetworkPartialSupport'
>
export type MapDispatch = Dispatch<
  SwitchNetworkRequestAction | AcceptNetworkPartialSupportAction
>
