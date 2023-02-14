import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { BaseAPI } from '../../../lib/api'
import {
  MoonPayConfig,
  Purchase,
  PurchasePaymentMethod,
  PurchaseStatus
} from '../types'
import {
  MoonPayPaymentMethod,
  MoonPayTransaction,
  MoonPayTransactionStatus
} from './types'

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

  private getPaymentMethod(
    paymentMethod: MoonPayPaymentMethod
  ): PurchasePaymentMethod {
    return {
      [MoonPayPaymentMethod.ACH_BANK_TRANSFER]:
        PurchasePaymentMethod.BANK_TRANSFER,
      [MoonPayPaymentMethod.CREDIT_DEBIT_CARD]:
        PurchasePaymentMethod.CREDIT_DEBIT_CARD,
      [MoonPayPaymentMethod.GBP_BANK_TRANSFER]:
        PurchasePaymentMethod.BANK_TRANSFER,
      [MoonPayPaymentMethod.GBP_OPEN_BANKING_PAYMENT]:
        PurchasePaymentMethod.UNKNOWN,
      [MoonPayPaymentMethod.MOBILE_WALLET]: PurchasePaymentMethod.UNKNOWN,
      [MoonPayPaymentMethod.PIX_INSTANT_PAYMENT]: PurchasePaymentMethod.UNKNOWN,
      [MoonPayPaymentMethod.SEPA_BANK_TRANSFER]:
        PurchasePaymentMethod.BANK_TRANSFER,
      [MoonPayPaymentMethod.SEPA_OPEN_BANKING_PAYMENT]:
        PurchasePaymentMethod.UNKNOWN
    }[paymentMethod]
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
      walletAddress,
      cryptoTransactionId,
      paymentMethod
    } = transaction

    return {
      id,
      amount: quoteCurrencyAmount,
      network,
      timestamp: +new Date(createdAt),
      status: this.getPurchaseStatus(status),
      paymentMethod: this.getPaymentMethod(paymentMethod),
      address: walletAddress,
      gateway: NetworkGatewayType.MOON_PAY,
      txHash: cryptoTransactionId
    }
  }

  getWidgetUrl(network: Network) {
    const redirectURL = `${window.location.origin}?network=${network}&gateway=${NetworkGatewayType.MOON_PAY}`
    return `${this.widgetBaseUrl}?apiKey=${
      this.apiKey
    }&currencyCode=MANA&redirectURL=${encodeURIComponent(redirectURL)}`
  }

  getTransactionReceiptUrl(transactionId: string) {
    return `${this.widgetBaseUrl}/transaction_receipt?transactionId=${transactionId}`
  }
}
