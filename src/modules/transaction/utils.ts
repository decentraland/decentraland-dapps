import { AnyAction } from 'redux'
import { Transaction, TransactionPayload } from './types'

// Special flag used to determine transaction hashes to be monitored
export const TRANSACTION_ACTION_FLAG = '_watch_tx'

export function isTransactionAction(action: AnyAction): boolean {
  return !!getTransactionFromAction(action)
}

export function getTransactionFromAction(action: AnyAction): Transaction {
  return action.payload && action.payload[TRANSACTION_ACTION_FLAG]
}

export function getTransactionHashFromAction(
  action: AnyAction
): Transaction['hash'] {
  return getTransactionFromAction(action).hash
}

export function buildTransactionPayload(
  hash: string,
  payload = {},
  events: string[] = []
): TransactionPayload {
  return {
    [TRANSACTION_ACTION_FLAG]: {
      hash,
      payload,
      events
    }
  }
}

export function buildTransactionWithReceiptPayload(
  hash: string,
  payload = {},
  events: string[] = []
): TransactionPayload {
  const txPayload = buildTransactionPayload(hash, payload, events)

  txPayload[TRANSACTION_ACTION_FLAG].withReceipt = true

  return txPayload
}

export type EtherscanHrefOptions = {
  txHash?: string
  address?: string
  blockNumber?: number
}

export function getEtherscanHref(
  { txHash, address, blockNumber }: EtherscanHrefOptions,
  network: string
) {
  const pathname = address
    ? `/address/${address}`
    : blockNumber
      ? `/block/${blockNumber}`
      : `/tx/${txHash}`

  return `${getEtherscanOrigin(network)}${pathname}`
}

export function getEtherscanOrigin(network: string) {
  let origin = 'https://etherscan.io'
  if (network && network !== 'mainnet') {
    origin = `https://${network}.etherscan.io`
  }
  return origin
}
