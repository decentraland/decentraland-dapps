import {
  ChainId,
  getNetwork,
  getNetworkMapping
} from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { Env, getEnv } from '@dcl/ui-env'
import { getRpcUrls } from 'decentraland-connect'

const RPC_URLS = getRpcUrls(ProviderType.NETWORK)

export const MANA_GRAPH_BY_CHAIN_ID = {
  [ChainId.ETHEREUM_MAINNET]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-mainnet',
  [ChainId.ETHEREUM_ROPSTEN]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-ropsten',
  [ChainId.ETHEREUM_GOERLI]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-goerli',
  [ChainId.ETHEREUM_RINKEBY]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-rinkeby',
  [ChainId.ETHEREUM_SEPOLIA]:
    'https://api.studio.thegraph.com/query/49472/mana-ethereum-sepolia/version/latest',
  [ChainId.MATIC_MAINNET]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mainnet',
  [ChainId.MATIC_MUMBAI]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mumbai',
  [ChainId.MATIC_AMOY]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-amoy',
  [ChainId.ETHEREUM_KOVAN]: '',
  [ChainId.BSC_MAINNET]: '',
  [ChainId.OPTIMISM_MAINNET]: '',
  [ChainId.ARBITRUM_MAINNET]: '',
  [ChainId.FANTOM_MAINNET]: '',
  [ChainId.AVALANCHE_MAINNET]: ''
}

type ChainConfiguration = {
  network: Network
  manaGraphURL: string
  rpcURL: string
  networkMapping: {
    [Network.ETHEREUM]: ChainId
    [Network.MATIC]: ChainId
  }
}

export function getChainConfiguration(chainId: ChainId): ChainConfiguration {
  return {
    network: getNetwork(chainId),
    manaGraphURL: MANA_GRAPH_BY_CHAIN_ID[chainId],
    rpcURL: RPC_URLS[chainId],
    networkMapping: getNetworkMapping(chainId)
  }
}

export function getAvailableChains(): ChainId[] {
  const isDev = getEnv() === Env.DEVELOPMENT
  return isDev
    ? [ChainId.ETHEREUM_SEPOLIA, ChainId.MATIC_MUMBAI, ChainId.MATIC_AMOY]
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
