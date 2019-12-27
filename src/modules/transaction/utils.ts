import { AnyAction } from 'redux'
import {
  Transaction,
  TransactionPayload,
  FINISHED_STATUS,
  ReplacedTransaction,
  TransactionStatus,
  AnyTransaction,
  QueuedTransaction,
  PendingTransaction,
  RevertedTransaction,
  ConfirmedTransaction
} from './types'
import { Eth } from 'web3x-es/eth'

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

export async function getTransaction(
  hash: string
): Promise<AnyTransaction | null> {
  const eth = Eth.fromCurrentProvider()
  if (!eth) return null

  const accounts = await eth.getAccounts()

  if (accounts.length === 0) {
    return null
  }

  let currentNonce: number | null
  try {
    currentNonce = await eth.getTransactionCount(accounts[0])
  } catch (error) {
    currentNonce = null
  }

  const response = await eth.getTransaction(hash)

  // not found
  if (response == null) {
    return null
  }

  if (response.blockNumber == null) {
    if (currentNonce != null) {
      // replaced
      if (response.nonce < currentNonce) {
        const tx: ReplacedTransaction = {
          hash,
          status: TransactionStatus.REPLACED,
          nonce: response.nonce
        }
        return tx
      }

      // queued
      if (response.nonce > currentNonce) {
        const tx: QueuedTransaction = {
          hash,
          status: TransactionStatus.QUEUED,
          nonce: response.nonce
        }
        return tx
      }
    }

    // pending
    const tx: PendingTransaction = {
      status: TransactionStatus.PENDING,
      ...response
    }
    return tx
  }

  const receipt = await eth.getTransactionReceipt(hash)

  // reverted
  if (receipt == null || !receipt.status) {
    const tx: RevertedTransaction = {
      status: TransactionStatus.REVERTED,
      ...response
    }
    return tx
  }

  // confirmed
  const tx: ConfirmedTransaction = {
    status: TransactionStatus.CONFIRMED,
    ...response,
    receipt
  }
  return tx
}
