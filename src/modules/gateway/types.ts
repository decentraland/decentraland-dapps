import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { TradeType } from './transak/types'

export type MoonPayConfig = {
  apiBaseUrl: string
  apiKey: string
  pollingDelay?: number
  widgetBaseUrl: string
}

export type TransakConfig = {
  key: string
  env: string
  pusher: {
    appKey: string
    appCluster: string
  }
}

export type ManaFiatGatewaySagasConfig = {
  [NetworkGatewayType.MOON_PAY]: MoonPayConfig
  [NetworkGatewayType.TRANSAK]: TransakConfig
}

export enum PurchaseStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMPLETE = 'complete'
}

type BasePurchase = {
  id: string
  network: Network
  gateway: NetworkGatewayType
  timestamp: number
  status: PurchaseStatus
  address: string
  txHash: string | null
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
