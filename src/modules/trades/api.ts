import { Trade, TradeCreation } from '@dcl/schemas'
import { BaseClient, BaseClientConfig } from '../../lib'

export class TradesAPI extends BaseClient {
  signer: string

  constructor(dappSigner: string, url: string, config?: BaseClientConfig) {
    super(url, config)
    this.signer = dappSigner
  }

  addTrade = async (trade: TradeCreation) => {
    return this.fetch<Trade>('/v1/trades', {
      method: 'POST',
      body: JSON.stringify(trade),
      metadata: {
        signer: this.signer,
        intent: `${this.signer}:create-trade`
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  fetchTrade = async (tradeId: string) => {
    return this.fetch<Trade>(`/v1/trades/${tradeId}`, { method: 'GET' })
  }
}
