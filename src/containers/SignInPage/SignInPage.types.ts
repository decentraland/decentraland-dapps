import { ProviderType } from 'decentraland-connect'
import { SignInProps } from 'decentraland-ui'

export type SignInPageProps = Omit<SignInProps, 'onConnect'> & {
  onConnect: (providerType: ProviderType) => any
  hasTranslations?: boolean
}

export type SignInPageState = {
  isLoginModalOpen: boolean
}

export type MapStateProps = Pick<
  SignInPageProps,
  'isConnecting' | 'isConnected' | 'hasTranslations' | 'hasError'
>
export type MapDispatchProps = {}
export type MapDispatch = {}
