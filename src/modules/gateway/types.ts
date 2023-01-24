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

type ManaPurchase = {
  id: string
  amount: number
  network: Network
  gateway: NetworkGatewayType
  timestamp: number
  status: PurchaseStatus
  address: string
  txHash: string | null
}

type NFTPurchase = {
  nft?: {
    contractAddress: string
    tokenId: string
    tradeType: TradeType
  } | null
}

export type Purchase = ManaPurchase & NFTPurchase
