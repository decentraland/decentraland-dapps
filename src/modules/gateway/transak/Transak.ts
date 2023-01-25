import transakSDK from '@transak/transak-sdk'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui'
import { TransakConfig, Purchase, PurchaseStatus } from '../types'
import { purchaseEventsChannel } from '../utils'
import {
  CustomizationOptions,
  DefaultCustomizationOptions,
  OrderData,
  TransakOrderStatus,
  TransakSDK
} from './types'

const PURCHASE_EVENT = 'Purchase status change'

export class Transak {
  private readonly config: TransakConfig
  private sdk: TransakSDK

  constructor(config: TransakConfig) {
    this.config = config
  }

  /**
   * Uses the sdk to suscribe to changes in the status of the transaction and dispatch an action depending on each different state.
   *
   * @param network - Network in which the trasanctions will be done
   */
  private suscribeToEvents(network: Network) {
    const events = [
      this.sdk.EVENTS.TRANSAK_ORDER_CREATED,
      this.sdk.EVENTS.TRANSAK_ORDER_SUCCESSFUL,
      this.sdk.EVENTS.TRANSAK_ORDER_FAILED,
      this.sdk.EVENTS.TRANSAK_ORDER_CANCELLED
    ]

    events.forEach(event => {
      this.sdk.on(event, (orderData: OrderData) =>
        this.emitPurchaseEvent(orderData, network)
      )
    })

    this.sdk.on(this.sdk.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setTimeout(() => {
        document.querySelector('html')?.style.removeProperty('overflow')
      }, 1000)
    })
  }

  private getPurchaseStatus(status: TransakOrderStatus): PurchaseStatus {
    return {
      [TransakOrderStatus.AWAITING_PAYMENT_FROM_USER]: PurchaseStatus.PENDING,
      [TransakOrderStatus.PAYMENT_DONE_MARKED_BY_USER]: PurchaseStatus.PENDING,
      [TransakOrderStatus.PROCESSING]: PurchaseStatus.PENDING,
      [TransakOrderStatus.PENDING_DELIVERY_FROM_TRANSAK]:
        PurchaseStatus.PENDING,
      [TransakOrderStatus.ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK]:
        PurchaseStatus.PENDING,
      [TransakOrderStatus.COMPLETED]: PurchaseStatus.COMPLETE,
      [TransakOrderStatus.REFUNDED]: PurchaseStatus.COMPLETE,
      [TransakOrderStatus.CANCELLED]: PurchaseStatus.CANCELLED,
      [TransakOrderStatus.FAILED]: PurchaseStatus.FAILED,
      [TransakOrderStatus.EXPIRED]: PurchaseStatus.FAILED
    }[status]
  }

  protected defaultCustomizationOptions(
    address: string
  ): DefaultCustomizationOptions {
    return {
      apiKey: this.config.key, // Your API Key
      environment: this.config.env || 'STAGING', // STAGING/PRODUCTION
      networks: 'ethereum,matic',
      walletAddress: address, // Your customer's wallet address
      hostURL: window.location.origin,
      widgetHeight: '650px',
      widgetWidth: '450px'
    }
  }

  protected customizationOptions(address: string): CustomizationOptions {
    return {
      ...this.defaultCustomizationOptions(address),
      defaultCryptoCurrency: 'MANA',
      cyptoCurrencyList: 'MANA',
      fiatCurrency: '', // INR/GBP
      email: '', // Your customer's email address
      redirectURL: ''
    }
  }

  /**
   * Given the data of the order and its status, returns an object with the relevant information of the purchase.
   *
   * @param orderData - Order entity that comes from the Transak SDK.
   * @param status - Status of the order.
   */
  private createPurchase(orderData: OrderData, network: Network): Purchase {
    const {
      status: {
        id,
        cryptoAmount,
        createdAt,
        status,
        isNFTOrder,
        nftAssetInfo,
        transactionHash,
        walletAddress
      }
    } = orderData

    return {
      id,
      network,
      timestamp: +new Date(createdAt),
      status: this.getPurchaseStatus(status),
      address: walletAddress,
      gateway: NetworkGatewayType.TRANSAK,
      txHash: transactionHash || null,
      amount: isNFTOrder ? 1 : cryptoAmount,
      ...(isNFTOrder && nftAssetInfo
        ? {
            nft: {
              contractAddress: nftAssetInfo?.contractAddress,
              tokenId: nftAssetInfo?.tokenId,
              tradeType: nftAssetInfo?.tradeType,
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
  emitPurchaseEvent(orderData: OrderData, network: Network) {
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

    const customizationOptions = this.customizationOptions(address)
    this.sdk = new transakSDK(customizationOptions) as TransakSDK
    this.suscribeToEvents(network)

    this.sdk.partnerData.walletAddress = address
    this.sdk.partnerData.defaultNetwork = transakNetwork
    this.sdk.partnerData.networks = transakNetwork
    this.sdk.init()
  }
}
