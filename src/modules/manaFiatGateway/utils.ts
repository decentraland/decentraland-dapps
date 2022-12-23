import { channel } from 'redux-saga'
import { ChainId, Network } from '@dcl/schemas'
import { Environment } from './types'

export const purchaseEventsChannel = channel()

const chainIdsByEnvAndNetwork = {
  [Environment.DEVELOPMENT]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_GOERLI,
    [Network.MATIC]: ChainId.MATIC_MUMBAI
  },
  [Environment.STAGING]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_MAINNET,
    [Network.MATIC]: ChainId.MATIC_MAINNET
  },
  [Environment.PRODUCTION]: {
    [Network.ETHEREUM]: ChainId.ETHEREUM_MAINNET,
    [Network.MATIC]: ChainId.MATIC_MAINNET
  }
}

export const getChainIdByEnvAndNetwork = (
  environment: Environment,
  network: Network
): ChainId => {
  const env =
    window.location.hostname === 'localhost'
      ? Environment.DEVELOPMENT
      : environment
  return chainIdsByEnvAndNetwork[env][network]
}
