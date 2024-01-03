import { Dispatch } from 'redux'
import { UserMenuProps } from 'decentraland-ui/dist/components/UserMenu/UserMenu.types'
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
  | 'manaBalances'
  | 'hasActivity'
  | 'hasTranslations'
>
export type MapDispatchProps = Pick<Props, 'onClickSignOut'>
export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | DisconnectWalletAction
>
export type OwnProps = Partial<Props>
