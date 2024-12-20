import { TransakConfig } from '@transak/transak-sdk'

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

export enum TradeType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export enum ProductsAvailed {
  BUY = 'BUY'
}

export type CustomizationOptions = {
  apiKey: string // Your API Key
  environment: TransakConfig['environment'] // PRODUCTION/STAGING
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
      collection: string
      tokenId: string[]
    }
    paymentOptionId: string
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
  data: Pick<OrderData['status'], 'id' | 'status' | 'transactionHash'> & {
    errorMessage: string | null
  }
}
