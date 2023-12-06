import { Dispatch } from 'redux'
import { UserInformationComponentProps } from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import {
  ConnectWalletRequestAction,
  DisconnectWalletAction
} from '../../modules/wallet/actions'

export type Props = Omit<UserInformationComponentProps, 'i18n' | 'notifications'> & {
  hasTranslations: boolean
  identity?: AuthIdentity
  withNotifications?: boolean
  locale: string
}

export type MapStateProps = Pick<
  Props,
  | 'isSignedIn'
  | 'isSigningIn'
  | 'address'
  | 'avatar'
  | 'manaBalances'
  | 'hasActivity'
  | 'hasTranslations'
  | 'locale'
>
export type MapDispatchProps = Pick<Props, 'onSignOut'>
export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | DisconnectWalletAction
>
export type OwnProps = Partial<Props>
