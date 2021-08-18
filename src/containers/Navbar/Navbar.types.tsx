import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui'
import {
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'

export type NavbarProps = NavbarComponentProps & {
  chainId?: ChainId
  hasTranslations?: boolean
  onSwitchNetwork: typeof switchNetworkRequest
}

export type NavbarState = {
  isPartialSupportModalOpen: boolean
}

export type MapStateProps = Pick<
  NavbarProps,
  | 'mana'
  | 'address'
  | 'isConnected'
  | 'isConnecting'
  | 'hasTranslations'
  | 'chainId'
>

export type MapDispatchProps = Pick<NavbarProps, 'onSwitchNetwork'>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
