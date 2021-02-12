export interface Wallet {
  address: string
  network: number
  mana: number
  manaL2: number
  eth: number
}

export interface CreateWalletOptions {
  MANA_ADDRESS?: string
  CHAIN_ID?: string | number
}
