import { AnyAction } from 'redux'
import {
  Transaction,
  TransactionPayload,
  FINISHED_STATUS,
  TransactionStatus,
  FAILED_STATUS,
  SUCCESS_STATUS
} from './types'

// Special flag used to determine transaction hashes to be monitored
export const TRANSACTION_ACTION_FLAG = '_watch_tx'

export function buildActionRef(transaction: Transaction) {
  const { actionType, events, withReceipt, payload } = transaction
  return {
    type: actionType,
    payload: (withReceipt
      ? buildTransactionWithReceiptPayload
      : buildTransactionPayload)(transaction.hash, payload, events)
  }
}

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
  network?: number
) {
  const pathname = address
    ? `/address/${address}`
    : blockNumber
    ? `/block/${blockNumber}`
    : `/tx/${txHash}`

  return `${getEtherscanOrigin(network)}${pathname}`
}

export function getEtherscanOrigin(network: number = 1) {
  switch (network) {
    case 3:
      return 'https://ropsten.etherscan.io'
    case 4:
      return 'https://rinkeby.etherscan.io'
    case 5:
      return 'https://goerli.etherscan.io'
    default:
      return 'https://etherscan.io'
  }
}

export function isPending(status: TransactionStatus | null): boolean {
  return !(FINISHED_STATUS as any[]).includes(status)
}

export function hasFailed(status: TransactionStatus | null): boolean {
  return (FAILED_STATUS as any[]).includes(status)
}

export function hasSucceeded(status: TransactionStatus | null): boolean {
  return (SUCCESS_STATUS as any[]).includes(status)
}
