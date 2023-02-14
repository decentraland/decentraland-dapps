import { EventEmitter } from 'ws'

export enum WebSocketEvents {
  ORDER_PAYMENT_VERIFYING = 'ORDER_PAYMENT_VERIFYING',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_FAILED = 'ORDER_FAILED'
}

export enum TransakOrderStatus {
  AWAITING_PAYMENT_FROM_USER = 'AWAITING_PAYMENT_FROM_USER',
  PAYMENT_DONE_MARKED_BY_USER = 'PAYMENT_DONE_MARKED_BY_USER',
  PROCESSING = 'PROCESSING',
  PENDING_DELIVERY_FROM_TRANSAK = 'PENDING_DELIVERY_FROM_TRANSAK',
  ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK = 'ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED'
}

export enum TransakPaymentMethod {
  CREDIT_DEBIT_CARD = 'credit_debit_card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  SEPA_BANK_TRANSFER = 'sepa_bank_transfer',
  GBP_BANK_TRANSFER = 'gbp_bank_transfer',
  UPI = 'upi',
  MOBIKWIK_WALLET = 'mobikwik_wallet'
}

export enum TradeType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export enum ProductsAvailed {
  BUY = 'BUY'
}

export type CustomizationOptions = {
  apiKey: string // Your API Key
  environment: string // PRODUCTION/STAGING
  networks: string
  walletAddress: string // Your customer's wallet address
  hostURL: string
  widgetHeight: string
  widgetWidth: string
  defaultCryptoCurrency?: 'MANA'
  cyptoCurrencyList?: 'MANA'
  fiatCurrency?: string
  email?: string // Your customer's email address
  redirectURL?: string
  contractAddress?: string // NFT Contract address
  tradeType?: TradeType // Can be primary in case of minting and secondary in case of secondary sale
  tokenId?: string // Decentraland tokenId in case of secondary sale and item id in case of primary sale (minting)
  productsAvailed?: ProductsAvailed // Would be BUY as NFT checkout is a special case of on ramping
  isNFT?: boolean // Will be true in case the bought assset is an NFT
}

export type DefaultCustomizationOptions = Pick<
  CustomizationOptions,
  | 'apiKey'
  | 'environment'
  | 'networks'
  | 'walletAddress'
  | 'hostURL'
  | 'widgetHeight'
  | 'widgetWidth'
>

export type OrderData = {
  eventName: string
  status: {
    id: string
    autoExpiresAt: string
    conversionPrice: number
    convertedFiatAmount: number
    convertedFiatCurrency: string
    createdAt: string
    cryptoAmount: number
    cryptoCurrency: string
    cryptocurrency: string
    envName: string
    fiatAmount: number
    fiatCurrency: string
    fromWalletAddress: string
    isBuyOrSell: 'BUY' | 'SELL'
    isNFTOrder: boolean
    transactionLink?: string
    transactionHash?: string
    network: 'ethereum' | 'matic'
    nftAssetInfo?: {
      contractAddress: string
      tokenId: string
      tradeType: TradeType
    }
    paymentOptionId: TransakPaymentMethod
    quoteId: string
    referenceCode: number
    reservationId: string
    status: TransakOrderStatus
    totalFeeInFiat: number
    walletAddress: string
    walletLink: string
  }
}

export type OrderResponse = {
  meta: {
    orderId: string
    apiKey: string
  }
  data: {
    id: OrderData['status']['id']
    status: OrderData['status']['status']
    transactionHash?: OrderData['status']['transactionHash']
    errorMessage?: string | null
  }
}

export type TransakSDK = EventEmitter & {
  init: () => void
  close: () => void
  partnerData: {
    defaultNetwork: string
    walletAddress: string
    partnerOrderId: string
    networks: string
  }
  EVENTS: Record<string, string>
}
