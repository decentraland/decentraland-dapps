import { Dispatch } from 'redux'
import { UserMenuProps } from 'decentraland-ui'
import {
  ConnectWalletRequestAction,
  DisconnectWalletAction
} from '../../modules/wallet/actions'

export type Props = UserMenuProps & { hasTranslations: boolean }

export type MapStateProps = Pick<
  Props,
  | 'isSignedIn'
  | 'isSigningIn'
  | 'address'
  | 'avatar'
  | 'mana'
  | 'manaL2'
  | 'hasActivity'
  | 'hasTranslations'
>
export type MapDispatchProps = Pick<Props, 'onSignIn' | 'onSignOut'>
export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | DisconnectWalletAction
>
export type OwnProps = Partial<Props>
