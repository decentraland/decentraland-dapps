import { Network } from '@dcl/schemas/dist/dapps/network'
import { Options, WidgetEvents } from '@wert-io/widget-initializer/types'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { TradeType } from './transak/types'

export enum FiatGateway {
  WERT = 'wert'
}

export type WertOptions = Options

export type FiatGatewayOptions = WertOptions // will be adding more options as we add more providers

export type FiatGatewayOnPendingListener = (event: WidgetEvents) => void
export type FiatGatewayOnSuccessListener = (event: WidgetEvents) => void
export type FiatGatewayOnLoadedListener = () => void

export type FiatGatewayListeners = {
  onLoaded?: FiatGatewayOnLoadedListener
  onPending?: FiatGatewayOnPendingListener
  onSuccess?: FiatGatewayOnSuccessListener
}

export type WertMessage = {
  address: string
  commodity: string
  commodity_amount: number
  network: string
  sc_address: string
  sc_input_data: string
}

export type WertConfig = {
  url: string
  marketplaceServerURL: string
}

export type MoonPayConfig = {
  apiBaseUrl: string
  apiKey: string
  pollingDelay?: number
  widgetBaseUrl: string
}

export type TransakConfig = {
  apiBaseUrl: string
  key: string
  env: string
  pollingDelay?: number
  pusher: {
    appKey: string
    appCluster: string
  }
}

export type ManaFiatGatewaySagasConfig = {
  [NetworkGatewayType.MOON_PAY]?: MoonPayConfig
  [NetworkGatewayType.TRANSAK]?: TransakConfig
}

export type FiatGatewaySagasConfig = {
  [FiatGateway.WERT]?: WertConfig
}

export type GatewaySagasConfig = FiatGatewaySagasConfig &
  ManaFiatGatewaySagasConfig

export enum PurchaseStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  COMPLETE = 'complete'
}

type BasePurchase = {
  id: string
  network: Network
  gateway: NetworkGatewayType
  timestamp: number
  status: PurchaseStatus
  paymentMethod: string
  address: string
  txHash: string | null
  failureReason?: string | null
}

export type ManaPurchase = BasePurchase & { amount: number }

export type NFTPurchase = BasePurchase & {
  nft: {
    contractAddress: string
    tokenId?: string
    itemId?: string
    tradeType: TradeType
    cryptoAmount: number
  }
}

export type Purchase = ManaPurchase | NFTPurchase
