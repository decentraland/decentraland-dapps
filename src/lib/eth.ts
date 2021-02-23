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

export async function getProvider(
  chainId?: ChainId
): Promise<ConnectedProvider | null> {
  try {
    let provider: ConnectedProvider | null

    if (chainId) {
      provider = await connection.createProvider(ProviderType.NETWORK, chainId)
    } else {
      const previousConnection = await connection.tryPreviousConnection()
      provider = previousConnection.provider
    }

    return provider
  } catch (error) {
    return null
  }
}

export function getProviderType(): ProviderType | null {
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
