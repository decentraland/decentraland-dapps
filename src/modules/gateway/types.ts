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
  [NetworkGatewayType.MOON_PAY]: MoonPayConfig
  [NetworkGatewayType.TRANSAK]: TransakConfig
}

export enum PurchaseStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMPLETE = 'complete'
}

export enum PurchasePaymentMethod {
  CREDIT_DEBIT_CARD = 'credit_debit_card',
  BANK_TRANSFER = 'bank_transfer',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  // TODO (buy MANA & NFTs with FIAT): finish the mapping between payment methods
  // https://docs.moonpay.com/moonpay/apis-and-webhooks/apis/client-side-apis/transactions
  // https://docs.transak.com/docs/control-the-fiat-or-crypto-options-for-the-user#payment-method
  OTHER = 'other'
}

type BasePurchase = {
  id: string
  network: Network
  gateway: NetworkGatewayType
  timestamp: number
  status: PurchaseStatus
  paymentMethod: PurchasePaymentMethod
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
