import { ChainId, Network } from '@dcl/schemas'
import { ProviderType as ConnectProviderType } from 'decentraland-connect'

export type ProviderType = ConnectProviderType

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
