import { Transak as TransakSDK } from '@transak/transak-sdk'
import Pusher from 'pusher-js'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { NetworkGatewayType } from 'decentraland-ui'
import { MarketplaceAPI } from '../../../lib/marketplaceApi'
import { Purchase, PurchaseStatus, TransakConfig } from '../types'
import { purchaseEventsChannel } from '../utils'
import {
  CustomizationOptions,
  OrderData,
  OrderResponse,
  TradeType,
  TransakOrderStatus,
  WebSocketEvents,
} from './types'

const PURCHASE_EVENT = 'Purchase status change'

export class Transak {
  private readonly pusher: Pusher
  private readonly marketplaceAPI: MarketplaceAPI
  private sdk: TransakSDK

  constructor(config: TransakConfig, identity?: AuthIdentity) {
    const {
      apiBaseUrl,
      pusher: { appCluster, appKey },
    } = config
    this.pusher = new Pusher(appKey, {
      cluster: appCluster,
    })
    this.marketplaceAPI = new MarketplaceAPI(apiBaseUrl, { identity })
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
          WebSocketEvents.ORDER_FAILED,
        ]

        const channel = this.pusher.subscribe(orderData.id)
        this.emitPurchaseEvent(orderData, network)

        events.forEach((event) => {
          channel.bind(event, (orderData: OrderData) => {
            this.emitPurchaseEvent(orderData, network)
            if (
              [
                WebSocketEvents.ORDER_COMPLETED,
                WebSocketEvents.ORDER_FAILED,
              ].includes(event)
            ) {
              this.pusher.unsubscribe(orderData.id)
            }
          })
        })
      },
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
      [TransakOrderStatus.EXPIRED]: PurchaseStatus.FAILED,
    }[status]
  }

  getItemIdFromUrl(url: string): string | undefined {
    const itemRegex = /\/items\/(\d+)/
    const itemMatch = url.match(itemRegex)

    if (itemMatch) {
      return itemMatch[1] // Return the item id
    }

    return undefined // Return null if no item id is found
  }

  getTokenIdFromUrl(url: string): string | undefined {
    const tokenRegex = /\/tokens\/(\d+)/
    const tokenMatch = url.match(tokenRegex)

    if (tokenMatch) {
      return tokenMatch[1] // Return the token id
    }

    return undefined // Return null if no token id is found
  }

  /**
   * Given the data of the order and its status, returns an object with the relevant information of the purchase.
   *
   * @param orderData - Order entity that comes from the Transak SDK.
   * @param status - Status of the order.
   */
  private createPurchase(orderData: OrderData, network: Network): Purchase {
    const {
      id,
      cryptoAmount,
      createdAt,
      status,
      isNFTOrder,
      nftAssetInfo,
      transactionHash,
      walletAddress,
      paymentOptionId,
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
              cryptoAmount,
            },
          }
        : {}),
    }
  }

  /**
   * Uses redux-saga channels to emit a message every time a transaction changes its status.
   *
   * @param orderData - Order entity that comes from the Transak SDK.
   * @param status - Status of the order.
   * @param Network - Network in which the transaction will be done.
   */
  emitPurchaseEvent(orderData: OrderData, network: Network) {
    purchaseEventsChannel.put({
      type: PURCHASE_EVENT,
      purchase: this.createPurchase(orderData, network),
    })
  }

  /**
   * Opens a widget using the init method of the Transak SDK.
   *
   * @param address - Address of the connected wallet.
   * @param network - Network in which the transaction will be done.
   */
  async openWidget(
    customizationOptions: Partial<CustomizationOptions> & { network: Network },
  ) {
    const { network, widgetHeight, widgetWidth, ...rest } = customizationOptions
    const transakNetwork = network === Network.MATIC ? 'polygon' : 'ethereum'

    const widgetUrl = await this.marketplaceAPI.getTransakWidgetUrl({
      ...rest,
      defaultNetwork: transakNetwork,
    })

    this.sdk = new TransakSDK({
      widgetUrl,
      referrer: window.location.origin,
      widgetHeight: widgetHeight || '650px',
      widgetWidth: widgetWidth || '450px',
    })

    this.suscribeToEvents(network)
    this.sdk.init()
  }

  /**
   * Given the order id, returns relevant data related to status changes (status & tx hash).
   *
   * @param orderId - Transak Order ID.
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    return await this.marketplaceAPI.getOrder(orderId)
  }
}
