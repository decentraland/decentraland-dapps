import transakSDK from '@transak/transak-sdk'
import { Network } from '@dcl/schemas'
import { Purchase, PurchaseStatus } from '../../mana/types'
import { OrderData, TransakSDK } from './types'
import { TransakConfig } from '../types'
import { purchaseEventsChannel } from '../utils'
import { NetworkGatewayType } from 'decentraland-ui'

const PURCHASE_EVENT = 'Purchase status change'

export class Transak {
  private readonly sdk: TransakSDK
  private readonly address: string

  constructor(config: TransakConfig, address: string, network: Network) {
    this.sdk = new transakSDK({
      apiKey: config.key, // Your API Key
      environment: config.env || 'STAGING', // STAGING/PRODUCTION
      defaultCryptoCurrency: 'MANA',
      cyptoCurrencyList: 'MANA',
      networks: 'ethereum,matic',
      walletAddress: address, // Your customer's wallet address
      fiatCurrency: '', // INR/GBP
      email: '', // Your customer's email address
      redirectURL: '',
      hostURL: window.location.origin,
      widgetHeight: '650px',
      widgetWidth: '450px'
    }) as TransakSDK
    this.address = address

    this.suscribeToEvents(network)
  }

  /**
   * Uses the sdk to suscribe to changes in the status of the transaction and dispatch an action depending on each different state.
   */
  private suscribeToEvents(network: Network) {
    const events = {
      [this.sdk.EVENTS.TRANSAK_ORDER_CREATED]: PurchaseStatus.PENDING,
      [this.sdk.EVENTS.TRANSAK_ORDER_SUCCESSFUL]: PurchaseStatus.COMPLETE,
      [this.sdk.EVENTS.TRANSAK_ORDER_FAILED]: PurchaseStatus.FAILED,
      [this.sdk.EVENTS.TRANSAK_ORDER_CANCELLED]: PurchaseStatus.CANCELLED
    }

    Object.entries(events).forEach(([event, status]) => {
      // this.handleStatusChange(orderData, status)
      this.sdk.on(event, (orderData: OrderData) =>
        purchaseEventsChannel.put({
          type: PURCHASE_EVENT,
          purchase: this.createPurchase(orderData, status, network)
        })
      )
    })
  }

  /**
   * Given the data of the order and its status, returns an object with the relevant information of the purchase.
   *
   * @param orderData - Order entity that comes from the Transak SDK.
   * @param status - Status of the order.
   */
  private createPurchase(
    orderData: OrderData,
    status: PurchaseStatus,
    network: Network
  ): Purchase {
    return {
      id: orderData.status.id,
      amount: orderData.status.cryptoAmount,
      network,
      timestamp: +new Date(orderData.status.createdAt),
      status,
      address: orderData.status.walletAddress,
      gateway: NetworkGatewayType.TRANSAK
    }
  }

  /**
   * Opens a widget using the init method of the Transak SDK.
   *
   * @param address - Address of the connected wallet.
   * @param network - Network in which the transaction will be done.
   */
  openWidget(network: Network) {
    const transakNetwork = network === Network.MATIC ? 'polygon' : 'ethereum'

    this.sdk.partnerData.walletAddress = this.address
    this.sdk.partnerData.defaultNetwork = transakNetwork
    this.sdk.partnerData.networks = transakNetwork
    this.sdk.init()
  }
}
