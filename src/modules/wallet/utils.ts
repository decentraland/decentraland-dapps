import { Eth } from 'web3x-es/eth'
import { HttpProvider } from 'web3x-es/providers'
import { Address } from 'web3x-es/address'
import { fromWei } from 'web3x-es/utils'
import { ChainId } from '@dcl/schemas'
import { getProvider, getProviderType } from '../../lib/eth'
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
    console.log(`Error fetching MANA balance:`, error)
    return 0
  }
}

export async function getWallet(): Promise<Wallet> {
  const provider = await getProvider()
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

  const address = accounts[0]
  const chainId = (await eth.getId()) as ChainId
  const { networkMapping } = getChainConfiguration(chainId)
  const networks: Partial<Networks> = {}

  for (const mapping of Object.values(networkMapping)) {
    for (const network of Object.keys(mapping)) {
      const networkChainId = mapping[network]
      const networkConfiguration = getChainConfiguration(networkChainId)
      const networkRPC = networkConfiguration.rpcURL

      const networkEth = new Eth(new HttpProvider(networkRPC))
      const [balance, mana] = await Promise.all([
        networkEth.getBalance(address),
        fetchManaBalance(networkConfiguration.manaGraphURL, address.toString())
      ])

      networks[network] = {
        chainId: networkChainId,
        balance,
        mana
      }
    }
  }

  console.log('WALLET BIATCH', {
    address: address.toString(),
    providerType: getProviderType()!,
    networks: networks as Networks,
    chainId
  })

  return {
    address: address.toString(),
    providerType: getProviderType()!,
    networks: networks as Networks,
    chainId
  }
}
