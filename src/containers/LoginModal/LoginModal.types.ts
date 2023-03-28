import { Dispatch } from 'redux'
import { LoginModalProps } from 'decentraland-ui/dist/components/LoginModal/LoginModal'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { EnableWalletRequestAction } from '../../modules/wallet/actions'
import { ModalProps } from '../../providers/ModalProvider/ModalProvider.types'

export type Metadata = {
  redirectUrl?: string
}

export type DefaultProps = { isLoading: boolean }

export type Props = DefaultProps &
  Omit<ModalProps, 'metadata'> &
  LoginModalProps & {
    hasTranslations?: boolean
    metadata: Metadata
    onConnect: (providerType: ProviderType) => any
  }

export type State = {
  hasError: boolean
}

export type OwnProps = Pick<Props, 'metadata'>

export type MapStateProps = Pick<
  Props,
  'hasTranslations' | 'isLoading' | 'hasError'
>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<EnableWalletRequestAction>
