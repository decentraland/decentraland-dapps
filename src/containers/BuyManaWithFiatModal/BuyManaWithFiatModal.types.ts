import { Dispatch } from 'redux'
import { Network } from '@dcl/schemas/dist/dapps/network'
import {
  BuyManaWithFiatModalI18N,
  BuyManaWithFiatModalNetworkI18N,
  BuyManaWithFiatModalNetworkProps,
  BuyManaWithFiatModalProps as BaseBuyManaWithFiatModalProps
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/BuyManaWithFiatModal'
import {
  BuyWithFiatNetworkProps,
  NetworkGatewayI18N,
  NetworkGatewayType,
  NetworkI18N
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { FeedbackModalI18N } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/FeedbackModal'
import { OpenManaFiatGatewayRequestAction } from '../../modules/gateway/actions'
import { ModalProps } from '../../providers/ModalProvider/ModalProvider.types'

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> &
  Partial<Pick<Type, Key>>

export type BuyManaWithFiatModalProps = MakeOptional<
  BaseBuyManaWithFiatModalProps,
  'networks'
>

export type Metadata = {
  selectedNetwork: Network
}

export type DefaultProps = { isLoading: boolean }

export type Props = DefaultProps &
  BuyManaWithFiatModalProps &
  Omit<ModalProps, 'metadata'> & {
    metadata: Metadata
    networks?:
    | (BuyManaWithFiatModalNetworkProps & BuyWithFiatNetworkProps)[]
    | undefined
    hasTranslations?: boolean
    onContinue: (network: Network, gateway: NetworkGatewayType) => void
  }

export type State = {
  hasError: boolean
}

export type MapStateProps = Pick<
  Props,
  'hasTranslations' | 'isLoading' | 'hasError'
>
export type MapDispatchProps = Pick<Props, 'onContinue' | 'onInfo'>
export type MapDispatch = Dispatch<OpenManaFiatGatewayRequestAction>

export type Translations =
  | BuyManaWithFiatModalI18N
  | (BuyManaWithFiatModalNetworkI18N & NetworkI18N)
  | NetworkGatewayI18N
  | FeedbackModalI18N
