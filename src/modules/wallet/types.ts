import { ChainId, Network } from '@dcl/schemas'
import { ProviderType } from 'decentraland-connect'

export { ProviderType }

export type NetworkData = {
  balance: number
  mana: number
  chainId: ChainId
}
export type Networks = Record<Network, NetworkData>

export interface Wallet {
  address: string
  networks: Networks
  network: Network
  chainId: ChainId
  providerType: ProviderType
}

export interface CreateWalletOptions {
  MANA_ADDRESS?: string
  CHAIN_ID?: string | number
}
