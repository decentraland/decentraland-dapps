import { ProviderType as ConnectProviderType } from 'decentraland-connect'

export type ProviderType = ConnectProviderType

export interface Wallet {
  address: string
  network: number
  mana: number
  manaL2: number
  eth: number
  providerType: ProviderType
}

export interface CreateWalletOptions {
  MANA_ADDRESS?: string
  CHAIN_ID?: string | number
}
