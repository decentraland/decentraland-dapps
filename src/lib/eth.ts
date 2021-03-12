import { ChainId } from '@dcl/schemas'
import { connection, ProviderType, Provider } from 'decentraland-connect'
import { isMobile } from './utils'

export type EthereumWindow = Window & {
  ethereum?: Provider & {
    enable?: () => Promise<string[]>
    isCucumber?: boolean
    isDapper?: boolean
  }
}

export async function getNetworkProvider(chainId: ChainId): Promise<Provider> {
  /*
    We check if the connected provider is from the same chainId, if so we return that one instead of creating one.
    This is to avoid using our own RPCs that much, and use the ones provided by the provider when possible.
  */
  if (getConnectedProviderChainId() === chainId) {
    const connectedProvider = await getConnectedProvider()
    if (connectedProvider) {
      return connectedProvider
    }
  }
  return connection.createProvider(ProviderType.NETWORK, chainId)
}

export async function getConnectedProvider(): Promise<Provider | null> {
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

export function getConnectedProviderChainId(): ChainId | null {
  const connectionData = connection.getConnectionData()
  return connectionData ? connectionData.chainId : null
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
