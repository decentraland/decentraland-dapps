import { Address } from 'web3x-es/address'
import { fromWei } from 'web3x-es/utils'
import { createEth, getProviderType } from '../../lib/eth'
import { Wallet } from './types'
import { graphql } from '../../lib/graph'

export const MANA_GRAPH_BY_NETWORK = {
  // Mainnet
  1: 'https://api.thegraph.com/subgraphs/name/decentraland/mana',
  // Ropsten
  3: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-ropsten',
  // Goerli
  5: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-goerli',
  // Matic Mainnet
  137: 'https://api.staging.thegraph.com/subgraphs/name/decentraland/mana-matic',
  // Matic Mumbai
  80001: 'https://api.staging.thegraph.com/subgraphs/name/decentraland/mana-mumbai'
}

export const MANA_L2_BY_L1_CHAIN_ID = {
  1: 137,
  3: 80001,
  5: 80001
}

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

export async function getWallet() {
  const eth = await createEth()
  if (!eth) {
    // This could happen if metamask is not installed
    throw new Error('Could not connect to Ethereum')
  }
  let accounts: Address[] = await eth.getAccounts()
  if (accounts.length === 0) {
    // This could happen if metamask was not enabled
    throw new Error('Could not get address')
  }
  const address = accounts[0]
  const network = await eth.getId()
  const ethBalance = await eth.getBalance(address)
  const mana = await fetchManaBalance(
    MANA_GRAPH_BY_NETWORK[network],
    address.toString()
  )
  const manaL2 = await fetchManaBalance(
    MANA_GRAPH_BY_NETWORK[MANA_L2_BY_L1_CHAIN_ID[network]],
    address.toString()
  )
  const providerType = getProviderType()!

  const wallet: Wallet = {
    address: address.toString(),
    mana,
    manaL2,
    eth: parseFloat(fromWei(ethBalance, 'ether')),
    network,
    providerType
  }

  return wallet
}
