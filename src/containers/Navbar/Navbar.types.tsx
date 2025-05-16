import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { AuthIdentity } from '@dcl/crypto'
import { NavbarProps as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import { NavbarProps as NavbarComponentProps2 } from 'decentraland-ui2'
import {
  disconnectWalletRequest,
  switchNetworkRequest,
  SwitchNetworkRequestAction
} from '../../modules/wallet/actions'
import { getCredits } from '../../modules/credits/selectors'

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
  onSignOut: typeof disconnectWalletRequest
  onSignIn: () => void
}

export type NavbarProps2 = NavbarComponentProps2 & {
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
  credits?: ReturnType<typeof getCredits>
  onSwitchNetwork: typeof switchNetworkRequest
  onSignOut: typeof disconnectWalletRequest
  onSignIn: () => void
}

export type MapStateProps = Pick<
  NavbarProps,
  | 'manaBalances'
  | 'address'
  | 'isSignedIn'
  | 'isDisconnecting'
  | 'isSigningIn'
  | 'chainId'
  | 'appChainId'
  | 'isSwitchingNetwork'
  | 'avatar'
  | 'locale'
  | 'walletError'
> &
  Pick<NavbarProps2, 'credits' | 'cdnLinks'>

export type MapDispatchProps = Pick<
  NavbarProps,
  'onSwitchNetwork' | 'onSignOut'
>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
