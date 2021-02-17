import { Address } from 'web3x-es/address'
import { fromWei } from 'web3x-es/utils'
import { createEth, getProviderType } from '../../lib/eth'
import { Wallet } from './types'
import { graphql } from '../../lib/graph'

export const MANA_GRAPH_BY_NETWORK = {
  // Ethereum Mainnet
  1: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-mainnet',
  // Ethereum Ropsten
  3: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-ropsten',
  // Ethereum Goerli
  5: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-goerli',
  // Matic Mainnet
  137: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mainnet',
  // Matic Mumbai
  80001: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mumbai'
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

  const { mana, manaL2 } = await getMana(address.toString(), network)

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

async function getMana(address: string, network: number) {
  const manaGraph = MANA_GRAPH_BY_NETWORK[network]
  const manaL2Graph = MANA_GRAPH_BY_NETWORK[MANA_L2_BY_L1_CHAIN_ID[network]]

  const [mana, manaL2] = await Promise.all([
    manaGraph ? fetchManaBalance(manaGraph, address) : 0,
    manaL2Graph ? fetchManaBalance(manaL2Graph, address) : 0
  ])

  return { mana, manaL2 }
}
