import { ChainId, Network } from '@dcl/schemas'
import { RPC_URLS } from 'decentraland-connect'

export const MANA_GRAPH_BY_CHAIN_ID = {
  [ChainId.ETHEREUM_MAINNET]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana',
  [ChainId.ETHEREUM_ROPSTEN]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ropsten',
  [ChainId.ETHEREUM_GOERLI]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-goerli',
  [ChainId.MATIC_MAINNET]:
    'https://api.staging.thegraph.com/subgraphs/name/decentraland/mana-matic',
  [ChainId.MATIC_MUMBAI]:
    'https://api.staging.thegraph.com/subgraphs/name/decentraland/mana-mumbai'
}

const NETWORK_MAPPING_BY_CHAIN_ID = {
  [ChainId.ETHEREUM_MAINNET]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_MAINNET,
    [Network.MATIC]: ChainId.MATIC_MAINNET
  },
  [ChainId.ETHEREUM_ROPSTEN]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_ROPSTEN,
    [Network.MATIC]: ChainId.MATIC_MUMBAI
  },
  [ChainId.ETHEREUM_GOERLI]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_GOERLI,
    [Network.MATIC]: ChainId.MATIC_MUMBAI
  },
  [ChainId.MATIC_MAINNET]: {
    [Network.ETHEREUM]: ChainId.MATIC_MAINNET,
    [Network.MATIC]: ChainId.MATIC_MAINNET
  },
  [ChainId.MATIC_MUMBAI]: {
    [Network.ETHEREUM]: ChainId.MATIC_MUMBAI,
    [Network.MATIC]: ChainId.MATIC_MUMBAI
  }
}

type ChainConfiguration = {
  manaGraphURL: string
  rpcURL: string
  networkMapping: Record<Network, ChainId>
}

export function getChainConfiguration(chainId: ChainId): ChainConfiguration {
  return {
    manaGraphURL: MANA_GRAPH_BY_CHAIN_ID[chainId],
    rpcURL: RPC_URLS[chainId],
    networkMapping: NETWORK_MAPPING_BY_CHAIN_ID[chainId]
  }
}
