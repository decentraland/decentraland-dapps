import transakSDK from '@transak/transak-sdk'
import { Network } from '@dcl/schemas'
import { Purchase, PurchaseStatus } from '../../mana/types'
import { OrderData, TransakSDK } from './types'
import { TransakConfig } from '../types'
import { purchaseEventsChannel } from '../utils'

const PURCHASE_EVENT = 'Purchase status change'

export class Transak {
  private readonly sdk: TransakSDK
  private readonly address: string

  constructor(config: TransakConfig, address: string) {
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

    this.suscribeToEvents()
  }

  /**
   * Uses the sdk to suscribe to changes in the status of the transaction and dispatch an action depending on each different state.
   */
  private suscribeToEvents() {
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
          purchase: this.createPurchase(orderData, status)
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
    status: PurchaseStatus
  ): Purchase {
    const network = this.getNetwork(orderData.status.network)

    return {
      id: orderData.status.id,
      amount: orderData.status.cryptoAmount,
      network,
      timestamp: +new Date(orderData.status.createdAt),
      status,
      address: orderData.status.walletAddress
    }
  }

  /**
   * Returns the name of the network if it's supported, or throws an exception otherwsie.
   *
   * @param networkName - Name of the network that comes from the Transak SDK Order entity.
   */
  private getNetwork(networkName: string) {
    const networks = Object.values(Network).filter(
      value => typeof value === 'string'
    ) as Network[]

    for (const network of networks) {
      if (network.toLowerCase() === networkName.toLowerCase()) {
        return network
      }
    }

    throw new Error(
      `Invalid network "${networkName}" is not part of the supported networks: ${networks.join(
        ', '
      )}`
    )
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
