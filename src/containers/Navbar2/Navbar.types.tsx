import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Navbar2Props as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar2/Navbar2.types'
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
  enablePartialSupportAlert?: boolean
  isSwitchingNetwork?: boolean
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
  | 'hasTranslations'
  | 'chainId'
  | 'appChainId'
  | 'isSwitchingNetwork'
>

export type MapDispatchProps = Pick<
  NavbarProps,
  'onSwitchNetwork' | 'onSignOut'
>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
