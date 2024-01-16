import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { AuthIdentity } from '@dcl/crypto'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import {
  disconnectWallet,
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'

export type Navbar2Props = NavbarComponentProps & {
  chainId?: ChainId
  appChainId: ChainId
  docsUrl?: string
  enablePartialSupportAlert?: boolean
  isSwitchingNetwork?: boolean
  withNotifications?: boolean
  identity?: AuthIdentity
  locale: string
  onSwitchNetwork: typeof switchNetworkRequest
  onSignOut: typeof disconnectWallet
  onSignIn: () => void
}

export type MapStateProps = Pick<
  Navbar2Props,
  | 'manaBalances'
  | 'address'
  | 'isSignedIn'
  | 'isSigningIn'
  | 'chainId'
  | 'appChainId'
  | 'isSwitchingNetwork'
  | 'avatar'
  | 'locale'
>

export type MapDispatchProps = Pick<
  Navbar2Props,
  'onSwitchNetwork' | 'onSignOut'
>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
