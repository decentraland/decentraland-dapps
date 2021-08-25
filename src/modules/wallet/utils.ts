import { call, select } from 'redux-saga/effects'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import {
  ContractData,
  ContractName,
  getContract,
  sendMetaTransaction
} from 'decentraland-transactions'
import { ChainId, getChainName } from '@dcl/schemas'
import { PopulatedTransaction, Contract, providers, utils } from 'ethers'
import {
  getConnectedProvider,
  getConnectedProviderChainId,
  getConnectedProviderType,
  getNetworkProvider
} from '../../lib/eth'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { AddEthereumChainParameters, Networks, Wallet } from './types'
import { getChainId } from './selectors'

let TRANSACTIONS_API_URL = 'https://transactions-api.decentraland.co/v1'
export const getTransactionsApiUrl = () => TRANSACTIONS_API_URL
export const setTransactionsApiUrl = (url: string) =>
  (TRANSACTIONS_API_URL = url)

export async function fetchManaBalance(chainId: ChainId, address: string) {
  try {
    const provider = await getNetworkProvider(chainId)
    const contract = getContract(ContractName.MANAToken, chainId)
    const mana = new Contract(
      contract.address,
      contract.abi,
      new providers.Web3Provider(provider)
    )
    const balance = await mana.balanceOf(address)
    return parseFloat(utils.formatEther(balance))
  } catch (error) {
    return 0
  }
}

export async function buildWallet(): Promise<Wallet> {
  const provider = await getConnectedProvider()

  if (!provider) {
    // This could happen if metamask is not installed
    throw new Error('Could not connect to Ethereum')
  }

  const eth = new Eth(provider)

  const accounts: Address[] = await eth.getAccounts()
  if (accounts.length === 0) {
    // This could happen if metamask was not enabled
    throw new Error('Could not get address')
  }

  const address = accounts[0].toString()
  const chainId = await eth.getId()
  const chainConfig = getChainConfiguration(chainId)
  const expectedChainId = getConnectedProviderChainId()!
  const expectedChainConfig = getChainConfiguration(expectedChainId)
  const networks: Partial<Networks> = {}

  for (const network of Object.keys(expectedChainConfig.networkMapping)) {
    const networkChainId = expectedChainConfig.networkMapping[network]
    networks[network] = {
      chainId: networkChainId,
      mana: await fetchManaBalance(networkChainId, address)
    }
  }

  return {
    address: address.toLowerCase(),
    providerType: getConnectedProviderType()!,
    networks: networks as Networks,
    network: chainConfig.network,
    chainId
  }
}

export async function getTargetNetworkProvider(chainId: ChainId) {
  const networkProvider = await getNetworkProvider(chainId)
  return new providers.Web3Provider(networkProvider)
}

export async function sendTransaction(
  chainId: ChainId,
  contract: ContractData,
  getPopulatedTransaction: (
    populateTransaction: Contract['populateTransaction']
  ) => Promise<PopulatedTransaction>
) {
  // get connected provider
  const connectedProvider = await getConnectedProvider()
  if (!connectedProvider) {
    throw new Error('Provider not connected')
  }

  // get a provider for the target network
  const targetNetworkProvider = await getTargetNetworkProvider(contract.chainId)

  // intantiate the contract
  const contractInstance = new Contract(
    contract.address,
    contract.abi,
    targetNetworkProvider
  )

  // populate the transaction data
  const unsignedTx = await getPopulatedTransaction(
    contractInstance.populateTransaction
  )

  // if the connected provider is in the target network, use it to sign and send the tx
  if (chainId === contract.chainId) {
    const signer = targetNetworkProvider.getSigner()
    const tx: providers.TransactionResponse = await signer.sendTransaction(
      unsignedTx
    )
    return tx.hash
  } else {
    // otherwise, send it as a meta tx
    const hash: string = await sendMetaTransaction(
      connectedProvider,
      targetNetworkProvider,
      unsignedTx.data!,
      contract,
      {
        serverURL: getTransactionsApiUrl()
      }
    )
    return hash
  }
}

export function* sendWalletTransaction(
  contract: ContractData,
  getPopulatedTransaction: (
    populateTransaction: Contract['populateTransaction']
  ) => Promise<PopulatedTransaction>
) {
  const chainId: ChainId | undefined = yield select(getChainId)
  if (!chainId) {
    throw new Error('Invalid chain id')
  }

  const hash: string = yield call(
    sendTransaction,
    chainId,
    contract,
    getPopulatedTransaction
  )

  return hash
}

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
    case ChainId.ETHEREUM_MAINNET:
    case ChainId.ETHEREUM_ROPSTEN:
    case ChainId.ETHEREUM_RINKEBY:
    case ChainId.ETHEREUM_KOVAN:
    case ChainId.ETHEREUM_GOERLI:
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
