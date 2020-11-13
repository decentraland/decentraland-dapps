import { Address } from 'web3x-es/address'
import { fromWei } from 'web3x-es/utils'
import { MANA } from '../../contracts/MANA'
import { Wallet } from './types'
import { createEth } from '../../lib/eth'

const MANA_ADDRESS_BY_NETWORK = {
  // Mainnet
  1: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  // Ropsten
  3: '0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb',
  // Rinkeby
  4: '0x28bce5263f5d7f4eb7e8c6d5d78275ca455bac63',
  // Kovan
  42: '0x230fc362413d9e862326c2c7084610a5a2fdf78a'
}

export async function getWallet() {
  const eth = await createEth()
  if (!eth) {
    // this could happen if metamask is not installed
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
  let manaBalance = '0'
  try {
    const mana = new MANA(
      eth,
      Address.fromString(MANA_ADDRESS_BY_NETWORK[network])
    )
    manaBalance = await mana.methods.balanceOf(address).call()
  } catch (e) {
    // Temporary fix. We should detect that the user should change the network
    console.warn('Could not get MANA balance')
  }

  const wallet: Wallet = {
    address: address.toString(),
    mana: parseFloat(fromWei(manaBalance, 'ether')),
    eth: parseFloat(fromWei(ethBalance, 'ether')),
    network
  }

  return wallet
}
