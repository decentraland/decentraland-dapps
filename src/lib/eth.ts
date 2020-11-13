import { Eth } from 'web3x-es/eth'
import {
  LegacyProviderAdapter,
  LegacyProvider,
  EthereumProvider
} from 'web3x-es/providers'

export async function getProvider(): Promise<EthereumProvider | null> {
  const { ethereum } = window as Window & { ethereum?: LegacyProvider }
  return ethereum ? new LegacyProviderAdapter(ethereum) : null
}

export async function createEth() {
  const provider = await getProvider()
  return provider ? new Eth(provider) : null
}
