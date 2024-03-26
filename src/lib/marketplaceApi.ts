import { AuthIdentity } from 'decentraland-crypto-fetch'
import { WertMessageWithTarget } from '../modules/gateway/types'
import { BaseClient } from './BaseClient'

export class MarketplaceAPI extends BaseClient {
  async signWertMessage(
    message: WertMessageWithTarget,
    identity: AuthIdentity
  ): Promise<string> {
    try {
      const response = await this.fetch<string>('/v1/wert/sign', {
        method: 'POST',
        identity,
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }
}
