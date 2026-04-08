import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import type { AnyAction } from 'redux'
import type { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import type { CrossChainProvider } from 'decentraland-transactions/esm/crossChain/types'

// Special flag used to determine transaction hashes to be monitored
export const TRANSACTION_ACTION_FLAG = '_watch_tx'
export type TRANSACTION_ACTION_FLAG = typeof TRANSACTION_ACTION_FLAG

export enum TransactionStatus {
  QUEUED = 'queued',
  DROPPED = 'dropped',
  REPLACED = 'replaced',
  PENDING = 'pending',
  REVERTED = 'reverted',
  CONFIRMED = 'confirmed'
}

export enum CrossChainProviderType {
  SQUID = 'squid'
}

export type DroppedTransaction = {
  status: TransactionStatus.DROPPED
  hash: string
  nonce: number
}

export type ReplacedTransaction = {
  status: TransactionStatus.REPLACED
  hash: string
  nonce: number
}

export type QueuedTransaction = {
  status: TransactionStatus.QUEUED
  hash: string
  nonce: number
}

export type PendingTransaction = TransactionResponse & {
  status: TransactionStatus.PENDING
}

export type RevertedTransaction = TransactionResponse & {
  status: TransactionStatus.REVERTED
  receipt: TransactionReceipt
}

export type ConfirmedTransaction = TransactionResponse & {
  status: TransactionStatus.CONFIRMED
  receipt: TransactionReceipt
}

export type AnyTransaction =
  | DroppedTransaction
  | ReplacedTransaction
  | QueuedTransaction
  | PendingTransaction
  | ConfirmedTransaction
  | RevertedTransaction

export const FINISHED_STATUS = [
  TransactionStatus.CONFIRMED,
  TransactionStatus.REVERTED,
  TransactionStatus.DROPPED,
  TransactionStatus.REPLACED
]

export const FAILED_STATUS = [TransactionStatus.DROPPED, TransactionStatus.REVERTED]

export const SUCCESS_STATUS = [TransactionStatus.REPLACED, TransactionStatus.CONFIRMED]

export type Transaction = {
  events: string[]
  hash: string
  nonce: number | null
  replacedBy: string | null
  timestamp: number
  from: string
  actionType: string
  status: AnyTransaction['status'] | null
  url: string
  isCrossChain: boolean
  requestId?: string
  toChainId?: ChainId
  crossChainProviderType?: CrossChainProviderType
  withReceipt?: boolean
  receipt?: { logs: TransactionReceipt['logs'] }
  payload?: any
  chainId: ChainId
}

export type TransactionPayload = {
  [key: string]: any
  [TRANSACTION_ACTION_FLAG]: {
    chainId: ChainId
    toChainId?: ChainId
    hash: string
    payload: any
    requestId?: string
    withReceipt?: boolean
    crossChainProviderType?: CrossChainProviderType
    from?: string // This could be undefined depending if its needed in the action
  }
}

export type ActionWithTransactionPayload = AnyAction & {
  payload: TransactionPayload
}

export type Arg = {
  name: string
  type: string
  value: string
}

export type Log = {
  events: Arg[]
  name: string
  [key: string]: any
}

export type TransactionsConfig = {
  crossChainProviderUrl: string
  getCrossChainProvider: () => Promise<new (...args: any[]) => CrossChainProvider>
  crossChainProviderRetryDelay?: number
  crossChainProviderNotFoundRetries?: number
}
