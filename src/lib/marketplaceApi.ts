import { BaseAPI } from './api'
import signedFetch, { AuthIdentity } from 'decentraland-crypto-fetch'
import { WertMessage } from '../modules/gateway/types'

export class MarketplaceAPI extends BaseAPI {
  signWertMessage = async (
    message: WertMessage,
    identity: AuthIdentity
  ): Promise<string> => {
    const url = `${this.url}/wert/sign`
    const response = await signedFetch(url, {
      method: 'POST',
      identity,
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    try {
      const json = await response.json()
      if (json.ok) {
        return json.data
      } else {
        throw new Error(json.message)
      }
    } catch (error) {
      console.log('error: ', error)
      throw new Error((error as Error).message)
    }
  }
}
