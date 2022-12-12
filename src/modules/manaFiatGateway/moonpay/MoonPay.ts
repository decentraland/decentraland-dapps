import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { BaseAPI } from '../../../lib/api'
import { Purchase, PurchaseStatus } from '../../mana/types'
import { MoonPayConfig } from '../types'
import { MoonPayTransaction, MoonPayTransactionStatus } from './types'

export class MoonPay {
  private readonly apiKey: string
  private readonly widgetBaseUrl: string
  private readonly moonPayAPI: BaseAPI

  constructor(config: MoonPayConfig) {
    const { apiKey, apiBaseUrl, widgetBaseUrl } = config

    this.apiKey = apiKey
    this.widgetBaseUrl = widgetBaseUrl
    this.moonPayAPI = new BaseAPI(apiBaseUrl)
  }

  private getPurchaseStatus(status: MoonPayTransactionStatus): PurchaseStatus {
    return {
      [MoonPayTransactionStatus.WAITING_PAYMENT]: PurchaseStatus.PENDING,
      [MoonPayTransactionStatus.PENDING]: PurchaseStatus.PENDING,
      [MoonPayTransactionStatus.WAITING_AUTHORIZATION]: PurchaseStatus.PENDING,
      [MoonPayTransactionStatus.FAILED]: PurchaseStatus.FAILED,
      [MoonPayTransactionStatus.COMPLETED]: PurchaseStatus.COMPLETE
    }[status]
  }

  /**
   * Given the transaction id, returns the MoonPay Transaction.
   *
   * @param transactionId - MoonPay Transaction ID.
   */
  async getTransaction(transactionId: string): Promise<MoonPayTransaction> {
    return await this.moonPayAPI.request(
      'GET',
      `/v1/transactions/${transactionId}`,
      { apiKey: this.apiKey }
    )
  }

  /**
   * Given the transaction, returns a Promise of an object with the relevant information of the purchase.
   *
   * @param transaction - MoonPay Transaction.
   */
  createPurchase(transaction: MoonPayTransaction, network: Network): Purchase {
    const {
      id,
      quoteCurrencyAmount,
      createdAt,
      status,
      walletAddress
    } = transaction

    return {
      id,
      amount: quoteCurrencyAmount,
      network,
      timestamp: +new Date(createdAt),
      status: this.getPurchaseStatus(status),
      address: walletAddress,
      gateway: NetworkGatewayType.MOON_PAY
    }
  }

  getWidgetUrl(network: Network) {
    const redirectURL = `${window.location.origin}?network=${network}&gateway=${NetworkGatewayType.MOON_PAY}`
    return `${this.widgetBaseUrl}?apiKey=${
      this.apiKey
    }&currencyCode=MANA&redirectURL=${encodeURIComponent(redirectURL)}`
  }
}
