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
  defaultNetwork: string
  walletAddress?: string // Your customer's wallet address
  widgetHeight: string
  widgetWidth: string
  fiatCurrency?: string
  email?: string // Your customer's email address
  redirectURL?: string
  contractAddress?: string // NFT Contract address
  tradeType?: TradeType // Can be primary in case of minting and secondary in case of secondary sale
  productsAvailed?: ProductsAvailed // Would be BUY as NFT checkout is a special case of on ramping
  isNFT?: boolean // Will be true in case the bought assset is an NFT
  contractId?: string
  estimatedGasLimit?: number
  nftData?: {
    imageURL: string
    nftName: string
    collectionAddress: string
    tokenID: string[]
    price: number[]
    quantity: number
    // 'ERC721' | 'ERC1155'
    nftType: string
  }[]
  calldata?: string
}

export type OrderData = {
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

export type OrderResponse = {
  meta: {
    orderId: string
  }
  data: Pick<OrderData, 'id' | 'status' | 'transactionHash'> & {
    errorMessage: string | null
  }
}
