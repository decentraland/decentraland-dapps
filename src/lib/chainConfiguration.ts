import { ChainId, getNetwork, getNetworkMapping } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { Env, getEnv } from '@dcl/ui-env'
import { getRpcUrls } from 'decentraland-connect'

const RPC_URLS: { [key in ChainId]: string } = getRpcUrls(ProviderType.NETWORK) as any

type ChainConfiguration = {
  network: Network
  rpcURL: string
  networkMapping: {
    [Network.ETHEREUM]: ChainId
    [Network.MATIC]: ChainId
  }
}

export function getChainConfiguration(chainId: ChainId): ChainConfiguration {
  return {
    network: getNetwork(chainId),
    rpcURL: RPC_URLS[chainId],
    networkMapping: getNetworkMapping(chainId)
  }
}

export function getAvailableChains(): ChainId[] {
  const isDev = getEnv() === Env.DEVELOPMENT
  return isDev
    ? [ChainId.ETHEREUM_SEPOLIA, ChainId.MATIC_AMOY]
    : [
        ChainId.ETHEREUM_MAINNET,
        ChainId.MATIC_MAINNET,
        ChainId.OPTIMISM_MAINNET,
        ChainId.ARBITRUM_MAINNET,
        ChainId.FANTOM_MAINNET,
        ChainId.AVALANCHE_MAINNET,
        ChainId.BSC_MAINNET
      ]
}
