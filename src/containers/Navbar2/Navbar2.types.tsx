import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Navbar2Props as NavbarComponentProps } from 'decentraland-ui/dist/components/Navbar2/Navbar2.types'
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
>

export type MapDispatchProps = Pick<
  Navbar2Props,
  'onSwitchNetwork' | 'onSignOut'
>
export type MapDispatch = Dispatch<SwitchNetworkRequestAction>
