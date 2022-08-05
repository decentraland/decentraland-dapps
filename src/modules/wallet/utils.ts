import { EventEmitter } from 'events'
import { ethers } from 'ethers'
import { Provider } from 'decentraland-connect'
import {
  ContractData,
  ContractName,
  getContract,
  sendMetaTransaction
} from 'decentraland-transactions'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import {
  getConnectedProvider,
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
    const mana = new ethers.Contract(
      contract.address,
      contract.abi,
      new ethers.providers.Web3Provider(provider)
    )
    const balance = await mana.balanceOf(address)
    return parseFloat(ethers.utils.formatEther(balance))
  } catch (error) {
    return 0
  }
}

export async function buildWallet(appChainId: ChainId): Promise<Wallet> {
  const provider = await getConnectedProvider()

  if (!provider) {
    // This could happen if metamask is not installed
    throw new Error('Could not connect to Ethereum')
  }

  const eth = new ethers.providers.Web3Provider(provider)

  const accounts: string[] = await eth.listAccounts()
  if (accounts.length === 0) {
    // This could happen if metamask was not enabled
    throw new Error('Could not get address')
  }

  const address = accounts[0].toString()
  const { chainId } = await eth.getNetwork()
  const chainConfig = getChainConfiguration(chainId)
  const appChainConfig = getChainConfiguration(appChainId)
  const networks: Partial<Networks> = {}

  for (const network of Object.keys(appChainConfig.networkMapping)) {
    const networkChainId = appChainConfig.networkMapping[network]
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
  return new ethers.providers.Web3Provider(networkProvider)
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
    populateTransaction: ethers.Contract['populateTransaction']
  ) => Promise<ethers.PopulatedTransaction>
): Promise<string>

export async function sendTransaction(...args: any[]) {
  const [
    contract,
    contractMethodNameOrGetPopulatedTransaction,
    ...contractArguments
  ] = args as [ContractData, string | Function, any[]]

  try {
    const connectedProvider = await getConnectedProvider()
    if (!connectedProvider) {
      throw new Error('Provider not connected')
    }

    const chainId = await getProviderChainId(connectedProvider)

    const targetNetworkProvider = await getTargetNetworkProvider(
      contract.chainId
    )

    const contractInstance = new ethers.Contract(
      contract.address,
      contract.abi,
      targetNetworkProvider
    )

    // Populate the transaction data
    const unsignedTx = await (typeof contractMethodNameOrGetPopulatedTransaction ===
    'function'
      ? contractMethodNameOrGetPopulatedTransaction(
          contractInstance.populateTransaction
        )
      : contractInstance.populateTransaction[
          contractMethodNameOrGetPopulatedTransaction
        ](...contractArguments))

    // If the connected provider is in the target network, use it to sign and send the tx
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

/**
 * Obtains the chain id through a provider.
 * Different providers might return the chain id as a hex or a number.
 * This function abtracts the logic in order to always obtain the chain id as a number from any given provider.
 * @param provider - The provider used to obtain the chain id
 * @returns A number representing the chain id, Eg: 80001 for Mumbai, 137 for Matic Mainnet
 */
export async function getProviderChainId(provider: Provider): Promise<number> {
  const providerChainId = (await provider.request({
    method: 'eth_chainId',
    params: []
  })) as string | number

  let chainId: number

  if (typeof providerChainId === 'string') {
    chainId = parseInt(providerChainId as string, 16)
  } else {
    chainId = providerChainId
  }

  return chainId
}

/**
 * Change the provider's chain to a provided chain.
 * In case it returns an error that the chain does not exist, it will try to add it.
 * @param provider - The provider used to swith the chain
 * @param chainId - The chain id that is being changed
 * @returns A number representing the chain id
 */
export async function switchProviderChainId(
  provider: Provider,
  chainId: ChainId
) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + chainId.toString(16) }]
    })

    return chainId
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (provider && switchError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [getAddEthereumChainParameters(chainId)]
        })
        const newChainId = await getProviderChainId(provider)

        if (chainId !== newChainId) {
          throw new Error('chainId did not change after adding network')
        }
        return chainId
      } catch (addError) {
        throw new Error(`Error adding network: ${addError.message}`)
      }
    }
    throw new Error(`Error switching network: ${switchError.message}`)
  }
}
