import { Eth } from 'web3x-es/eth'
import { LegacyProviderAdapter, EthereumProvider } from 'web3x-es/providers'

export type Provider = EthereumProvider & {
  enable?: () => Promise<string[]>
  isCucumber?: boolean
}

export type EthereumWindow = Window & {
  ethereum?: Provider
}

export async function getProvider(): Promise<Provider | null> {
  const { ethereum } = window as EthereumWindow
  return ethereum ? ethereum : null
}

export async function createEth() {
  const provider = await getProvider()
  return provider ? new Eth(new LegacyProviderAdapter(provider as any)) : null
}
