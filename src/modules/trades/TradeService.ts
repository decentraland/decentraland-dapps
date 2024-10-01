import { Trade, TradeCreation } from '@dcl/schemas'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { ContractName, getContract } from 'decentraland-transactions'
import { TradesAPI } from './api'
import { getOnChainTrade } from '../../lib/trades'
import { sendTransaction } from '../wallet/utils'

export class TradeService {
  private tradesAPI: TradesAPI

  constructor(
    signer: string,
    basePath: string,
    getIdentity: () => AuthIdentity | undefined
  ) {
    this.tradesAPI = new TradesAPI(signer, basePath, {
      identity: getIdentity,
      retries: 0
    })
  }

  async addTrade(trade: TradeCreation) {
    return this.tradesAPI.addTrade(trade)
  }

  async fetchTrade(tradeId: string) {
    return this.tradesAPI.fetchTrade(tradeId)
  }

  async accept(trade: Trade, sentBeneficiaryAddress: string) {
    const offchainMarketplaceContract = getContract(
      ContractName.OffChainMarketplace,
      trade.chainId
    )
    const tradeToAccept = getOnChainTrade(trade, sentBeneficiaryAddress)
    return sendTransaction(offchainMarketplaceContract, 'accept', [
      tradeToAccept
    ])
  }

  async cancel(trade: Trade, sentBeneficiaryAddress: string) {
    const offchainMarketplaceContract = getContract(
      ContractName.OffChainMarketplace,
      trade.chainId
    )
    const tradeToCancel = getOnChainTrade(trade, sentBeneficiaryAddress)
    return sendTransaction(offchainMarketplaceContract, 'cancelSignature', [
      tradeToCancel
    ])
  }
}
