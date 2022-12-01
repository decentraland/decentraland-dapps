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
import { OpenManaFiatGatewayAction } from '../../modules/manaFiatGateway/actions'

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> &
  Partial<Pick<Type, Key>>

export type BuyManaWithFiatModalProps = MakeOptional<
  BaseBuyManaWithFiatModalProps,
  'networks'
>

export type DefaultProps = { isLoading: boolean }

export type Props = DefaultProps &
  BuyManaWithFiatModalProps & {
    selectedNetwork?: Network
    networks?:
      | (BuyManaWithFiatModalNetworkProps & BuyWithFiatNetworkProps)[]
      | undefined
    hasTranslations?: boolean
    widgetUrl?: string
    onContinue?: (network: Network, gateway: NetworkGatewayType) => void
  }

export type State = {
  hasError: boolean
  gatewayIsOpen: boolean
}

export type MapStateProps = Pick<
  Props,
  'widgetUrl' | 'hasTranslations' | 'isLoading' | 'hasError'
>
export type MapDispatchProps = Pick<Props, 'onContinue' | 'onInfo'>
export type MapDispatch = Dispatch<OpenManaFiatGatewayAction>

export type Translations =
  | BuyManaWithFiatModalI18N
  | (BuyManaWithFiatModalNetworkI18N & NetworkI18N)
  | NetworkGatewayI18N
