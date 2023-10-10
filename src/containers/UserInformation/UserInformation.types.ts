import { Dispatch } from 'redux'
import { UserInformationComponentProps } from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import {
  ConnectWalletRequestAction,
  DisconnectWalletAction
} from '../../modules/wallet/actions'

export type Props = Omit<UserInformationComponentProps, 'i18n'> & {
  hasTranslations: boolean
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
>
export type MapDispatchProps = Pick<Props, 'onSignOut'>
export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | DisconnectWalletAction
>
export type OwnProps = Partial<Props>
