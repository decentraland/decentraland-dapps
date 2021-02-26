import { AnyAction } from 'redux'
import { ChainId } from '@dcl/schemas'
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
  const { actionType, withReceipt, payload } = transaction
  const buildFunction = withReceipt
    ? buildTransactionWithReceiptPayload
    : buildTransactionPayload
  return {
    type: actionType,
    payload: buildFunction(transaction.chainId, transaction.hash, payload)
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
  chainId: ChainId,
  hash: string,
  payload = {}
): TransactionPayload {
  return {
    [TRANSACTION_ACTION_FLAG]: {
      chainId,
      hash,
      payload
    }
  }
}

export function buildTransactionWithReceiptPayload(
  chainId: ChainId,
  hash: string,
  payload = {}
): TransactionPayload {
  const txPayload = buildTransactionPayload(chainId, hash, payload)

  txPayload[TRANSACTION_ACTION_FLAG].withReceipt = true

  return txPayload
}

export type TransactionHrefOptions = {
  txHash?: string
  address?: string
  blockNumber?: number
}

export function getTransactionHref(
  { txHash, address, blockNumber }: TransactionHrefOptions,
  network?: number
) {
  const pathname = address
    ? `/address/${address}`
    : blockNumber
    ? `/block/${blockNumber}`
    : `/tx/${txHash}`

  return `${getTransactionOrigin(network)}${pathname}`
}

export function getTransactionOrigin(
  chainId: number = ChainId.ETHEREUM_MAINNET
) {
  switch (chainId) {
    case ChainId.ETHEREUM_ROPSTEN:
      return 'https://ropsten.etherscan.io'
    case ChainId.ETHEREUM_RINKEBY:
      return 'https://rinkeby.etherscan.io'
    case ChainId.ETHEREUM_GOERLI:
      return 'https://goerli.etherscan.io'
    case ChainId.MATIC_MAINNET:
      return 'https://explorer-mainnet.maticvigil.com'
    case ChainId.MATIC_MUMBAI:
      return 'https://explorer-mumbai.maticvigil.com'
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
