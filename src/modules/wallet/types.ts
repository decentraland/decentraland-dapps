import { contracts } from 'decentraland-eth'
import { Locale } from 'decentraland-ui'

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
  locale?: Locale
  derivationPath?: string
}

export interface EthereumWindow {
  ethereum?: {
    _metamask: { isApproved: () => Promise<boolean> }
    isApproved: () => Promise<boolean>

    enable: () => Promise<string[]>
  }
}
