import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { RPC_URLS } from 'decentraland-connect/dist/connectors/NetworkConnector'

export const MANA_GRAPH_BY_CHAIN_ID = {
  [ChainId.ETHEREUM_MAINNET]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-mainnet',
  [ChainId.ETHEREUM_ROPSTEN]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-ropsten',
  [ChainId.ETHEREUM_GOERLI]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-goerli',
  [ChainId.ETHEREUM_RINKEBY]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-rinkeby',
  [ChainId.MATIC_MAINNET]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mainnet',
  [ChainId.MATIC_MUMBAI]:
    'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mumbai'
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
  [ChainId.ETHEREUM_RINKEBY]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_RINKEBY,
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

const NETWORK_BY_CHAIN_ID: Record<ChainId, Network> = {
  [ChainId.ETHEREUM_MAINNET]: Network.ETHEREUM,
  [ChainId.ETHEREUM_ROPSTEN]: Network.ETHEREUM,
  [ChainId.ETHEREUM_GOERLI]: Network.ETHEREUM,
  [ChainId.ETHEREUM_KOVAN]: Network.ETHEREUM,
  [ChainId.ETHEREUM_RINKEBY]: Network.ETHEREUM,
  [ChainId.MATIC_MAINNET]: Network.MATIC,
  [ChainId.MATIC_MUMBAI]: Network.MATIC
}

type ChainConfiguration = {
  network: Network
  manaGraphURL: string
  rpcURL: string
  networkMapping: Record<Network, ChainId>
}

export function getChainConfiguration(chainId: ChainId): ChainConfiguration {
  return {
    network: NETWORK_BY_CHAIN_ID[chainId],
    manaGraphURL: MANA_GRAPH_BY_CHAIN_ID[chainId],
    rpcURL: RPC_URLS[chainId],
    networkMapping: NETWORK_MAPPING_BY_CHAIN_ID[chainId]
  }
}
