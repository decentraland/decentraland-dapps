import {
  Transak as TransakSDK,
  TransakConfig as TransakSDKConfig
} from '@transak/transak-sdk'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import Pusher from 'pusher-js'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui'
import { BaseAPI } from '../../../lib/api'
import { TransakConfig, Purchase, PurchaseStatus } from '../types'
import { purchaseEventsChannel } from '../utils'
import {
  CustomizationOptions,
  DefaultCustomizationOptions,
  OrderData,
  OrderResponse,
  TradeType,
  TransakOrderStatus,
  WebSocketEvents
} from './types'

const PURCHASE_EVENT = 'Purchase status change'

export class Transak {
  private readonly config: TransakConfig
  private readonly customizationOptions: Partial<CustomizationOptions>
  private readonly pusher: Pusher
  private readonly transakAPI: BaseAPI
  private readonly identity: AuthIdentity | undefined
  private sdk: TransakSDK

  constructor(
    config: TransakConfig,
    customizationOptions?: Partial<CustomizationOptions>,
    identity?: AuthIdentity
  ) {
    const {
      apiBaseUrl,
      pusher: { appCluster, appKey }
    } = config
    this.config = config
    this.customizationOptions = customizationOptions || {}
    this.pusher = new Pusher(appKey, {
      cluster: appCluster
    })
    this.transakAPI = new BaseAPI(apiBaseUrl)
    this.identity = identity
  }

  /**
   * Uses the sdk to suscribe to changes in the status of the transaction and dispatch an action depending on each different state.
   *
   * @param network - Network in which the trasanctions will be done
   */
  private suscribeToEvents(network: Network) {
    if (!TransakSDK.EVENTS) {
      return
    }
    TransakSDK.on(
      TransakSDK.EVENTS.TRANSAK_ORDER_CREATED,
      (orderData: OrderData) => {
        const events = [
          WebSocketEvents.ORDER_PAYMENT_VERIFYING,
          WebSocketEvents.ORDER_PROCESSING,
          WebSocketEvents.ORDER_COMPLETED,
          WebSocketEvents.ORDER_FAILED
        ]

        const channel = this.pusher.subscribe(orderData.status.id)
        this.emitPurchaseEvent(orderData.status, network)

        events.forEach(event => {
          channel.bind(event, (orderData: OrderData['status']) => {
            this.emitPurchaseEvent(orderData, network)
            if (
              [
                WebSocketEvents.ORDER_COMPLETED,
                WebSocketEvents.ORDER_FAILED
              ].includes(event)
            ) {
              this.pusher.unsubscribe(orderData.id)
            }
          })
        })
      }
    )

    TransakSDK.on(TransakSDK.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setTimeout(() => {
        document.querySelector('html')?.style.removeProperty('overflow')
      }, 1000)
      this.sdk.close()
    })
  }

  getPurchaseStatus(status: TransakOrderStatus): PurchaseStatus {
    return {
      [TransakOrderStatus.AWAITING_PAYMENT_FROM_USER]: PurchaseStatus.PENDING,
      [TransakOrderStatus.PAYMENT_DONE_MARKED_BY_USER]: PurchaseStatus.PENDING,
      [TransakOrderStatus.PROCESSING]: PurchaseStatus.PENDING,
      [TransakOrderStatus.PENDING_DELIVERY_FROM_TRANSAK]:
        PurchaseStatus.PENDING,
      [TransakOrderStatus.ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK]:
        PurchaseStatus.PENDING,
      [TransakOrderStatus.COMPLETED]: PurchaseStatus.COMPLETE,
      [TransakOrderStatus.REFUNDED]: PurchaseStatus.REFUNDED,
      [TransakOrderStatus.CANCELLED]: PurchaseStatus.CANCELLED,
      [TransakOrderStatus.FAILED]: PurchaseStatus.FAILED,
      [TransakOrderStatus.EXPIRED]: PurchaseStatus.FAILED
    }[status]
  }

  private defaultCustomizationOptions(
    address: string
  ): DefaultCustomizationOptions {
    return {
      apiKey: this.config.key, // Your API Key
      environment: (this.config.env ||
        'STAGING') as TransakSDKConfig['environment'], // STAGING/PRODUCTION
      networks: 'ethereum,matic',
      walletAddress: address, // Your customer's wallet address
      hostURL: window.location.origin,
      widgetHeight: '650px',
      widgetWidth: '450px'
    }
  }

  getItemIdFromUrl(url: string): string | null {
    const itemRegex = /\/items\/(\d+)/
    const itemMatch = url.match(itemRegex)

    if (itemMatch) {
      return itemMatch[1] // Return the item id
    }

    return null // Return null if no item id is found
  }

  getTokenIdFromUrl(url: string): string | null {
    const tokenRegex = /\/tokens\/(\d+)/
    const tokenMatch = url.match(tokenRegex)

    if (tokenMatch) {
      return tokenMatch[1] // Return the token id
    }

    return null // Return null if no token id is found
  }

  /**
   * Given the data of the order and its status, returns an object with the relevant information of the purchase.
   *
   * @param orderData - Order entity that comes from the Transak SDK.
   * @param status - Status of the order.
   */
  private createPurchase(
    orderData: OrderData['status'],
    network: Network
  ): Purchase {
    const {
      id,
      cryptoAmount,
      createdAt,
      status,
      isNFTOrder,
      nftAssetInfo,
      transactionHash,
      walletAddress,
      paymentOptionId
    } = orderData

    // read if there's item in the URL and set the item id otherwise set the token id
    const itemId = this.getItemIdFromUrl(window.location.href)
    const tokenId = this.getTokenIdFromUrl(window.location.href)

    return {
      id,
      network,
      timestamp: +new Date(createdAt),
      status: this.getPurchaseStatus(status),
      paymentMethod: paymentOptionId,
      address: walletAddress,
      gateway: NetworkGatewayType.TRANSAK,
      txHash: transactionHash || null,
      amount: isNFTOrder ? 1 : cryptoAmount,
      ...(isNFTOrder && nftAssetInfo
        ? {
            nft: {
              contractAddress: nftAssetInfo.collection,
              tokenId,
              itemId,
              tradeType: itemId ? TradeType.PRIMARY : TradeType.SECONDARY,
              cryptoAmount
            }
          }
        : {})
    }
  }

  /**
   * Uses redux-saga channels to emit a message every time a transaction changes its status.
   *
   * @param orderData - Order entity that comes from the Transak SDK.
   * @param status - Status of the order.
   * @param Network - Network in which the transaction will be done.
   */
  emitPurchaseEvent(orderData: OrderData['status'], network: Network) {
    purchaseEventsChannel.put({
      type: PURCHASE_EVENT,
      purchase: this.createPurchase(orderData, network)
    })
  }

  /**
   * Opens a widget using the init method of the Transak SDK.
   *
   * @param address - Address of the connected wallet.
   * @param network - Network in which the transaction will be done.
   */
  openWidget(address: string, network: Network) {
    const transakNetwork = network === Network.MATIC ? 'polygon' : 'ethereum'

    const customizationOptions = {
      ...this.defaultCustomizationOptions(address),
      ...this.customizationOptions
    }
    const config = {
      ...customizationOptions,
      defaultNetwork: transakNetwork,
      walletAddress: address,
      networks: transakNetwork
    }
    this.sdk = new TransakSDK(config) as TransakSDK
    console.log('config in dapps: ', config)
    this.suscribeToEvents(network)
    this.sdk.init()
  }

  /**
   * Given the order id, returns relevant data related to status changes (status & tx hash).
   *
   * @param orderId - Transak Order ID.
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    return await this.transakAPI.request(
      'GET',
      `/transak/orders/${orderId}`,
      { identity: this.identity },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
