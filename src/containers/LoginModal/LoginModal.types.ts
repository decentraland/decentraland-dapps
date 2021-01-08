import { Dispatch } from 'redux'
import { LoginModalProps } from 'decentraland-ui'
import {
  enableWalletRequest,
  EnableWalletRequestAction
} from '../../modules/wallet/actions'

export type Props = LoginModalProps & {
  hasTranslations?: boolean
  isLoading: boolean
  isConnected: boolean
  isConnecting: boolean
  onConnect: typeof enableWalletRequest
}

export type State = {
  hasError: boolean
}

export type MapStateProps = Pick<
  Props,
  'hasTranslations' | 'isLoading' | 'isConnected' | 'isConnecting' | 'hasError'
>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<EnableWalletRequestAction>
