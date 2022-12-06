import { EventEmitter } from 'ws'

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
    network: 'ethereum' | 'matic'
    paymentOptionId: string
    quoteId: string
    referenceCode: number
    reservationId: string
    status: string
    totalFeeInFiat: number
    walletAddress: string
    walletLink: string
  }
}

export type TransakSDK = EventEmitter & {
  init: () => void
  partnerData: {
    defaultNetwork: string
    walletAddress: string
    partnerOrderId: string
    networks: string
  }
  EVENTS: Record<string, string>
}
