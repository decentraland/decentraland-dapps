import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { getChainConfiguration } from '../../../lib/chainConfiguration'
import { AddEthereumChainParameters } from '../types'

export function getAddEthereumChainParameters(
  chainId: ChainId
): AddEthereumChainParameters {
  const hexChainId = '0x' + chainId.toString(16)
  const chainName = getChainName(chainId)!
  const config = getChainConfiguration(chainId)
  switch (chainId) {
    case ChainId.MATIC_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
        blockExplorerUrls: ['https://polygonscan.com/']
      }
    case ChainId.MATIC_MUMBAI:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/']
      }
    case ChainId.MATIC_AMOY:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://rpc-amoy.polygon.technology/'],
        blockExplorerUrls: ['https://www.oklink.com/amoy']
      }
    case ChainId.BSC_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
      }
    case ChainId.OPTIMISM_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.optimism.io/'],
        blockExplorerUrls: ['https://optimistic.etherscan.io/']
      }
    case ChainId.ARBITRUM_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/']
      }
    case ChainId.FANTOM_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'Fantom',
          symbol: 'FTM',
          decimals: 18
        },
        rpcUrls: ['https://rpcapi.fantom.network'],
        blockExplorerUrls: ['https://ftmscan.com/']
      }
    case ChainId.AVALANCHE_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'AVAX',
          symbol: 'AVAX',
          decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io']
      }
    case ChainId.ETHEREUM_MAINNET:
    case ChainId.ETHEREUM_ROPSTEN:
    case ChainId.ETHEREUM_RINKEBY:
    case ChainId.ETHEREUM_KOVAN:
    case ChainId.ETHEREUM_GOERLI:
    case ChainId.ETHEREUM_SEPOLIA:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: [config.rpcURL],
        blockExplorerUrls: ['https://etherscan.io']
      }
  }
}
