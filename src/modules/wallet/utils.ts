import { eth, wallets, Contract } from 'decentraland-eth'
import { isMobile } from '../../lib/utils'
import { EthereumWindow } from './types'

interface ConnectOptions {
  address: string
  provider: object | string
  contracts: Contract[]
  derivationPath?: string
  eth: typeof eth
}

export async function connectEthereumWallet(
  options: ConnectOptions,
  retries = 0
): Promise<void> {
  try {
    const { provider, contracts, eth } = options
    await eth.connect({
      provider,
      contracts,
      wallets: getWallets(options, retries)
    })
    eth.wallet.getAccount() // throws on empty accounts
  } catch (error) {
    if (retries >= 3) {
      console.warn(
        `Error trying to connect to Ethereum for the ${retries}th time`,
        error
      )
      throw error
    }
    await new Promise(resolve => setTimeout(() => resolve(), 50))
    return connectEthereumWallet(options, retries + 1)
  }
}

function getWallets(
  options: ConnectOptions,
  retries: number
): wallets.NodeWallet[] | wallets.LedgerWallet[] {
  const { LedgerWallet, NodeWallet } = wallets
  const { address, derivationPath = '' } = options

  return isMobile() || retries < 2
    ? [new NodeWallet(address)]
    : [new LedgerWallet(address, derivationPath)]
}

export function isLedgerWallet() {
  return eth.wallet instanceof wallets.LedgerWallet
}

export function isApprovableWallet() {
  const { ethereum } = window as EthereumWindow
  return ethereum !== undefined && typeof ethereum.enable === 'function'
}

export async function isWalletApproved() {
  const { ethereum } = window as EthereumWindow

  if (ethereum === undefined) {
    return false
  }

  // `isApproved` is not standard. It's supported by MetaMask and it's expected to be implemented by other wallet vendors
  // but we need to check just in case.
  const aprobable = ethereum._metamask || ethereum
  return aprobable.isApproved ? await aprobable.isApproved() : true
}
