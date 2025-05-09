import { AuthIdentity } from 'decentraland-crypto-fetch'
import { WertPayload } from '../modules/gateway/types'
import { OrderResponse } from '../modules/gateway/transak/types'
import { BaseClient } from './BaseClient'

export class MarketplaceAPI extends BaseClient {
  async signWertMessageAndCreateSession(
    body: WertPayload,
    identity: AuthIdentity
  ): Promise<{ signature: string; sessionId: string }> {
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
  async getOrder(
    orderId: string,
    identity: AuthIdentity
  ): Promise<OrderResponse> {
    return await this.fetch<OrderResponse>(`/v1/transak/orders/${orderId}`, {
      identity
    })
  }
}
