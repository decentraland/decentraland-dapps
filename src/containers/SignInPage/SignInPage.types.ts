import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui/dist/components/SignIn/SignIn'
import { openModal, OpenModalAction } from '../../modules/modal/actions'

export type SignInPageProps = Omit<SignInProps, 'onConnect'> & {
  onConnect: () => ReturnType<typeof openModal>
  hasTranslations?: boolean
}

export type MapStateProps = Pick<
  SignInPageProps,
  'isConnecting' | 'isConnected' | 'hasTranslations' | 'hasError'
>
export type MapDispatchProps = Pick<SignInPageProps, 'onConnect'>
export type MapDispatch = Dispatch<OpenModalAction>
