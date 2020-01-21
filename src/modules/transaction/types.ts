import { TransactionResponse, TransactionReceipt } from 'web3x-es/formatters'

export enum TransactionStatus {
  QUEUED = 'queued',
  DROPPED = 'dropped',
  REPLACED = 'replaced',
  PENDING = 'pending',
  REVERTED = 'reverted',
  CONFIRMED = 'confirmed'
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

export const FAILED_STATUS = [
  TransactionStatus.DROPPED,
  TransactionStatus.REVERTED
]

export const SUCCESS_STATUS = [
  TransactionStatus.REPLACED,
  TransactionStatus.CONFIRMED
]

export type Transaction = {
  events: string[]
  hash: string
  nonce: number | null
  replacedBy: string | null
  timestamp: number
  from: string
  actionType: string
  status: AnyTransaction['status'] | null
  withReceipt?: boolean
  receipt?: { logs: TransactionReceipt['logs'] }
  payload?: any
}

export type TransactionPayload = {
  [hash: string]: {
    hash: string
    payload: any
    events: string[]
    withReceipt?: boolean
  }
}

export enum NetworkName {
  mainnet = 'mainnet',
  ropsten = 'ropsten',
  kovan = 'kovan',
  rinkeby = 'rinkeby'
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
