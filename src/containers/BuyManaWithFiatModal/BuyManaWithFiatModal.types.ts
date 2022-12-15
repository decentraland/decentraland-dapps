import { Dispatch } from 'redux'
import { Network } from '@dcl/schemas'
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
import {
  CloseManaFiatFeedbackModalRequestAction,
  OpenManaFiatGatewayRequestAction
} from '../../modules/manaFiatGateway/actions'
import { FeedbackModalI18N } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/FeedbackModal'

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> &
  Partial<Pick<Type, Key>>

export type BuyManaWithFiatModalProps = MakeOptional<
  BaseBuyManaWithFiatModalProps,
  'networks'
>

export type DefaultProps = { isLoading: boolean; showFeedback?: boolean }

export type Props = DefaultProps &
  BuyManaWithFiatModalProps & {
    selectedNetwork?: Network
    networks?:
      | (BuyManaWithFiatModalNetworkProps & BuyWithFiatNetworkProps)[]
      | undefined
    hasTranslations?: boolean
    onContinue?: (network: Network, gateway: NetworkGatewayType) => void
    onCloseFeedback?: () => void
  }

export type State = {
  hasError: boolean
}

export type MapStateProps = Pick<
  Props,
  'hasTranslations' | 'isLoading' | 'hasError' | 'showFeedback'
>
export type MapDispatchProps = Pick<
  Props,
  'onContinue' | 'onInfo' | 'onCloseFeedback'
>
export type MapDispatch = Dispatch<
  OpenManaFiatGatewayRequestAction | CloseManaFiatFeedbackModalRequestAction
>

export type Translations =
  | BuyManaWithFiatModalI18N
  | (BuyManaWithFiatModalNetworkI18N & NetworkI18N)
  | NetworkGatewayI18N
  | FeedbackModalI18N
