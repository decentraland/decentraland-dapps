import { Eth } from 'web3x-es/eth'
import { LegacyProviderAdapter, EthereumProvider } from 'web3x-es/providers'
import { connection, ChainId } from 'decentraland-connect'
import { isMobile } from './utils'

export type Provider = EthereumProvider & {
  enable?: () => Promise<string[]>
  isCucumber?: boolean
  isDapper?: boolean
}

export type EthereumWindow = Window & {
  ethereum?: Provider
}

export async function createEth() {
  try {
    const { provider } = await connection.tryPreviousConnection()
    return provider ? new Eth(new LegacyProviderAdapter(provider as any)) : null
  } catch (error) {
    return null
  }
}

export function isCucumberProvider() {
  const provider = (window as EthereumWindow).ethereum
  return isMobile() && !!provider && !!provider.isCucumber
}

export function isDapperProvider() {
  const provider = (window as EthereumWindow).ethereum
  return !!provider && !!provider.isDapper
}

export function isValidChainId(chainId: string | number) {
  return Object.values(ChainId).includes(Number(chainId))
}
