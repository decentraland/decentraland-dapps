import { EthereumProvider } from 'web3x-es/providers'
import { ChainId } from '@dcl/schemas'
import {
  connection,
  ProviderType,
  Provider as ConnectedProvider
} from 'decentraland-connect'
import { isMobile } from './utils'

export type Provider = EthereumProvider & {
  enable?: () => Promise<string[]>
  isCucumber?: boolean
  isDapper?: boolean
}

export type EthereumWindow = Window & {
  ethereum?: Provider
}

export async function createProvider(
  providerType: ProviderType,
  chainId: ChainId
): Promise<ConnectedProvider> {
  return connection.createProvider(providerType, chainId)
}

export async function getConnectedProvider(): Promise<ConnectedProvider | null> {
  try {
    const { provider } = await connection.tryPreviousConnection()
    return provider ? provider : null
  } catch (error) {
    return null
  }
}

export function getConnectedProviderType(): ProviderType | null {
  const connectionData = connection.getConnectionData()
  return connectionData ? connectionData.providerType : null
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
