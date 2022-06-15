import { connection, Provider } from 'decentraland-connect'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { ethers } from 'ethers'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { getChainConfiguration } from './chainConfiguration'
import { isMobile } from './utils'

export type EthereumWindow = Window & {
  ethereum?: Provider & {
    enable?: () => Promise<string[]>
    isCucumber?: boolean
    isDapper?: boolean
    isToshi?: boolean
  }
}

export async function getNetworkProvider(chainId: ChainId): Promise<Provider> {
  /*
    We check if the connected provider is from the same chainId, if so we return that one instead of creating one.
    This is to avoid using our own RPCs that much, and use the ones provided by the provider when possible.
  */
  const connectedProvider = await getConnectedProvider()
  if (connectedProvider) {
    const connectedChainId = await new ethers.providers.Web3Provider(
      connectedProvider
    )
      .getSigner()
      .getChainId()
    if (chainId === connectedChainId) {
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

export async function getSigner(): Promise<ethers.Signer> {
  const provider = await getConnectedProvider()
  if (!provider) {
    throw new Error('Could not connect to provider')
  }

  const eth = new ethers.providers.Web3Provider(provider)
  return eth.getSigner()
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

export function isCoinbaseProvider() {
  const provider = (window as EthereumWindow).ethereum
  return !!provider && !!provider.isToshi
}

export function isValidChainId(chainId: string | number) {
  return Object.values(ChainId).includes(Number(chainId))
}

export function getChainIdByNetwork(network: Network) {
  const connectedChainId = getConnectedProviderChainId()
  if (!connectedChainId) {
    throw new Error('Could not get connected provider chain id')
  }
  const config = getChainConfiguration(connectedChainId)
  return config.networkMapping[network]
}
