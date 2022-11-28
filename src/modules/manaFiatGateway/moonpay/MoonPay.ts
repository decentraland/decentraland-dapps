import { Network } from '@dcl/schemas'
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

  private async getTransaction(
    transactionId: string
  ): Promise<MoonPayTransaction> {
    return await this.moonPayAPI.request(
      'GET',
      `/v1/transactions/${transactionId}`,
      { apiKey: this.apiKey }
    )
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
   * Given the transaction id, returns a Promise of an object with the relevant information of the purchase.
   *
   * @param transactionId - MoonPay Transaction ID.
   */
  async createPurchase(
    transactionId: string,
    network: Network
  ): Promise<Purchase> {
    const {
      id,
      quoteCurrencyAmount,
      createdAt,
      status,
      walletAddress
    }: MoonPayTransaction = await this.getTransaction(transactionId)

    return {
      id,
      amount: quoteCurrencyAmount,
      network,
      timestamp: +new Date(createdAt),
      status: this.getPurchaseStatus(status),
      address: walletAddress
    }
  }

  getTransactionStatus = async (transactionId: string): Promise<string> => {
    const { status }: MoonPayTransaction = await this.getTransaction(
      transactionId
    )
    return status
  }

  widgetUrl(address: string) {
    return `${this.widgetBaseUrl}?apiKey=${this.apiKey}&currencyCode=MANA&walletAddres=${address}&redirectURL=${window.location.origin}`
  }
}
