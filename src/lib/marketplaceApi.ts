import { AuthIdentity } from 'decentraland-crypto-fetch'
import { OrderResponse, CustomizationOptions as TransakCustomizationOptions } from '../modules/gateway/transak/types'
import { WertPayload } from '../modules/gateway/types'
import { BaseClient } from './BaseClient'

export class MarketplaceAPI extends BaseClient {
  async signWertMessageAndCreateSession(body: WertPayload, identity: AuthIdentity): Promise<{ signature: string; sessionId: string }> {
    try {
      const response = await this.fetch<{
        signature: string
        sessionId: string
      }>('/v1/wert/sign', {
        method: 'POST',
        identity,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }
  /**
   * Given the order id, returns relevant data related to status changes (status & tx hash).
   *
   * @param orderId - Transak Order ID.
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    return this.fetch<OrderResponse>(`/v1/transak/orders/${orderId}`)
  }

  /**
   * Given the customization options, returns the widget url for the Transak widget.
   *
   * @param customizationOptions - Customization options for the Transak widget.
   */
  async getTransakWidgetUrl(customizationOptions: Omit<TransakCustomizationOptions, 'widgetHeight' | 'widgetWidth'>): Promise<string> {
    return this.fetch<string>('/v1/transak/widget-url', {
      method: 'post',
      body: JSON.stringify(customizationOptions),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
