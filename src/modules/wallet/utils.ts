import { Eth } from 'web3x-es/eth'
import { ChainId } from '@dcl/schemas'
import { Address } from 'web3x-es/address'
import { ContractName, getContract } from 'decentraland-transactions'
import { Contract, providers, utils } from 'ethers'
import {
  getConnectedProvider,
  getConnectedProviderType,
  getNetworkProvider
} from '../../lib/eth'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { Networks, Wallet } from './types'

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
  const chainId = (await eth.getId()) as ChainId
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
