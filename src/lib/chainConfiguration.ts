import {
  ChainId,
  getNetwork,
  getNetworkMapping
} from '@dcl/schemas/dist/dapps/chain-id'
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

type ChainConfiguration = {
  network: Network
  manaGraphURL: string
  rpcURL: string
  networkMapping: Record<Network, ChainId>
}

export function getChainConfiguration(chainId: ChainId): ChainConfiguration {
  return {
    network: getNetwork(chainId),
    manaGraphURL: MANA_GRAPH_BY_CHAIN_ID[chainId],
    rpcURL: RPC_URLS[chainId],
    networkMapping: getNetworkMapping(chainId)
  }
}
