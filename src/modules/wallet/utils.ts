import { call, select } from 'redux-saga/effects'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import {
  ContractData,
  ContractName,
  getContract,
  sendMetaTransaction
} from 'decentraland-transactions'
import { Provider } from 'decentraland-connect'
import { ChainId } from '@dcl/schemas'
import { PopulatedTransaction, Contract, providers, utils } from 'ethers'
import {
  getConnectedProvider,
  getConnectedProviderChainId,
  getConnectedProviderType,
  getNetworkProvider
} from '../../lib/eth'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { Networks, Wallet } from './types'
import { getAddress, getChainId } from './selectors'

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
  const chainId = getConnectedProviderChainId()!
  const config = getChainConfiguration(chainId)
  const networks: Partial<Networks> = {}

  for (const network of Object.keys(config.networkMapping)) {
    const networkChainId = config.networkMapping[network]
    networks[network] = {
      chainId: networkChainId,
      mana: await fetchManaBalance(networkChainId, address)
    }
  }

  return {
    address: address.toLowerCase(),
    providerType: getConnectedProviderType()!,
    networks: networks as Networks,
    network: config.network,
    chainId
  }
}

async function getTargetNetworkProvider(chainId: ChainId) {
  const networkProvider = await getNetworkProvider(chainId)
  return new providers.Web3Provider(networkProvider)
}

export function* sendWalletTransaction(
  contract: ContractData,
  getPopulatedTransaction: (
    populateTransaction: Contract['populateTransaction']
  ) => Promise<PopulatedTransaction>
) {
  // get connected address
  const from: string | undefined = yield select(getAddress)
  if (!from) {
    throw new Error('Invalid address')
  }

  // get connected provider
  const connectedProvider: Provider = yield call(getConnectedProvider)
  if (!connectedProvider) {
    throw new Error('Provider not connected')
  }

  // get a provider for the target network
  const targetNetworkProvider: providers.Web3Provider = yield call(
    getTargetNetworkProvider,
    contract.chainId
  )

  // intantiate the contract
  const contractInstance = new Contract(
    contract.address,
    contract.abi,
    targetNetworkProvider
  )

  // populate the transaction data
  const unsignedTx: PopulatedTransaction = yield call(
    getPopulatedTransaction,
    contractInstance.populateTransaction
  )

  // if the connected provider is in the target network, use it to sign and send the tx
  const currentChainId: ChainId = yield select(getChainId)
  if (currentChainId === contract.chainId) {
    const signer = targetNetworkProvider.getSigner()
    const tx: providers.TransactionResponse = yield call(
      [signer, 'sendTransaction'],
      unsignedTx
    )
    return tx.hash
  } else {
    // otherwise, send it as a meta tx
    const hash: string = yield call(
      sendMetaTransaction,
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
