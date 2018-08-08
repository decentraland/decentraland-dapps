import { contracts } from 'decentraland-eth'

export type BigNumber = {
  toString(): string
  toNumber(): number
}
export interface ERC20Token extends contracts.ERC20Token {
  balanceOf(address: string): Promise<BigNumber>
  decimals(): Promise<BigNumber>
}

export interface BaseWallet {
  type: string
  network: string
  address: string
  mana: number
  locale?: string
  derivationPath?: string
}
