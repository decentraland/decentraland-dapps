import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { AuthIdentity } from '@dcl/crypto'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import {
  disconnectWallet,
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'

export type NavbarProps = NavbarComponentProps & {
  withChainSelector?: boolean
  chainId?: ChainId
  appChainId: ChainId
  docsUrl?: string
  enablePartialSupportAlert?: boolean
  isSwitchingNetwork?: boolean
  withNotifications?: boolean
  identity?: AuthIdentity
  locale: string
  walletError: string | null
  onSwitchNetwork: typeof switchNetworkRequest
  onSignOut: typeof disconnectWallet
  onSignIn: () => void
}

export type MapStateProps = Pick<
  NavbarProps,
  | 'manaBalances'
  | 'address'
  | 'isSignedIn'
  | 'isSigningIn'
  | 'chainId'
  | 'appChainId'
  | 'isSwitchingNetwork'
  | 'avatar'
  | 'locale'
  | 'walletError'
>

export type MapDispatchProps = Pick<
  NavbarProps,
  'onSwitchNetwork' | 'onSignOut'
>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
