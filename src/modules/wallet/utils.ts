import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { fromWei } from 'web3x-es/utils'
import { ChainId } from '@dcl/schemas'
import { getConnectedProvider, getConnectedProviderType } from '../../lib/eth'
import { graphql } from '../../lib/graph'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { Networks, Wallet } from './types'

export const getManaBalanceQuery = (address: string) => `query {
  accounts(where:{ id: "${address.toLowerCase()}" }) {
    id
    mana
  }
}`

export async function fetchManaBalance(graphUrl: string, address: string) {
  try {
    const { accounts } = await graphql<{
      accounts: { id: string; mana: string }[]
    }>(graphUrl, getManaBalanceQuery(address))

    if (accounts.length === 0) {
      throw new Error(
        `No results for Graph URL "${graphUrl}" and address "${address}"`
      )
    }

    return parseFloat(fromWei(accounts[0].mana, 'ether'))
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
    const networkConfiguration = getChainConfiguration(networkChainId)

    networks[network] = {
      chainId: networkChainId,
      mana: await fetchManaBalance(networkConfiguration.manaGraphURL, address)
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
