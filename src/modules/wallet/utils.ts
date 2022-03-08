import { EventEmitter } from 'events'
import { PopulatedTransaction, Contract, providers, utils } from 'ethers'
import { Eth } from 'web3x/eth'
import { Address } from 'web3x/address'
import {
  ContractData,
  ContractName,
  getContract,
  sendMetaTransaction
} from 'decentraland-transactions'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import {
  getConnectedProvider,
  getConnectedProviderChainId,
  getConnectedProviderType,
  getNetworkProvider
} from '../../lib/eth'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { AddEthereumChainParameters, Networks, Wallet } from './types'

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

export enum TransactionEventType {
  ERROR = 'error',
  SUCCESS = 'success'
}

export type TransactionEventData<T extends TransactionEventType> = {
  type: T
} & (T extends TransactionEventType.ERROR
  ? { error: Error }
  : T extends TransactionEventType.SUCCESS
  ? { txHash: string }
  : {})

export const transactionEvents = new EventEmitter()

/**
 * Sends a transaction either as a meta transaction or as a regular transaction.
 * - If the contract chain id differs from the current provider chain id, a meta transaction will be sent.
 * - If the contract chain id is the same as the current provider chain id, a regular transaction will be sent.
 * @param contract - The contract to send the transaction to.
 * @param contractMethodName - The name of the contract method to call.
 * @param contractMethodArgs - The arguments to pass to the contract method.
 */
export async function sendTransaction(
  contract: ContractData,
  contractMethodName: string,
  ...contractArguments: any[]
): Promise<string>

/**
 * @deprecated
 * Sends a transaction either as a meta transaction or as a regular transaction.
 * - If the contract chain id differs from the current provider chain id, a meta transaction will be sent.
 * - If the contract chain id is the same as the current provider chain id, a regular transaction will be sent.
 * @param contract - The contract to send the transaction to.
 * @param getPopulatedTransaction - A function that returns a populated transaction.
 */
export async function sendTransaction(
  contract: ContractData,
  getPopulatedTransaction: (
    populateTransaction: Contract['populateTransaction']
  ) => Promise<PopulatedTransaction>
): Promise<string>

export async function sendTransaction(...args: any[]) {
  const [
    contract,
    contractMethodNameOrGetPopulatedTransaction,
    ...contractArguments
  ] = args as [ContractData, string | Function, any[]]

  try {
    // get connected provider
    const connectedProvider = await getConnectedProvider()
    if (!connectedProvider) {
      throw new Error('Provider not connected')
    }

    // get current chain id
    const chainIdHex = await connectedProvider.request({
      method: 'eth_chainId',
      params: []
    })
    const chainId = parseInt(chainIdHex as string, 16)

    // get a provider for the target network
    const targetNetworkProvider = await getTargetNetworkProvider(
      contract.chainId
    )

    // intantiate the contract
    const contractInstance = new Contract(
      contract.address,
      contract.abi,
      targetNetworkProvider
    )

    // populate the transaction data
    const unsignedTx = await (typeof contractMethodNameOrGetPopulatedTransaction ===
    'function'
      ? contractMethodNameOrGetPopulatedTransaction(
          contractInstance.populateTransaction
        )
      : contractInstance.populateTransaction[
          contractMethodNameOrGetPopulatedTransaction
        ](...contractArguments))

    // if the connected provider is in the target network, use it to sign and send the tx
    if (chainId === contract.chainId) {
      const signer = targetNetworkProvider.getSigner()
      const tx = await signer.sendTransaction(unsignedTx)
      transactionEvents.emit(TransactionEventType.SUCCESS, { txHash: tx.hash })
      return tx.hash
    } else {
      // otherwise, send it as a meta tx
      const txHash = await sendMetaTransaction(
        connectedProvider,
        targetNetworkProvider,
        unsignedTx.data!,
        contract,
        {
          serverURL: getTransactionsApiUrl()
        }
      )
      transactionEvents.emit(TransactionEventType.SUCCESS, { txHash })
      return txHash
    }
  } catch (error) {
    const data: TransactionEventData<TransactionEventType.ERROR> = {
      type: TransactionEventType.ERROR,
      error: error as Error
    }
    transactionEvents.emit(TransactionEventType.ERROR, data)
    throw error
  }
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
