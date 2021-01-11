import { SignInProps } from 'decentraland-ui'

export type SignInPageProps = SignInProps & {
  hasTranslations?: boolean
}

export type SignInPageState = {
  isLoginModalOpen: boolean
}

export type MapStateProps = Pick<
  SignInPageProps,
  'isConnecting' | 'isConnected' | 'hasTranslations'
>

export type MapDispatchProps = Pick<SignInPageProps, 'onConnect'>
