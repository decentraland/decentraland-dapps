import { txUtils } from 'decentraland-eth'

export const FINISHED_TYPES = [
  txUtils.TRANSACTION_TYPES.confirmed,
  txUtils.TRANSACTION_TYPES.reverted,
  txUtils.TRANSACTION_TYPES.dropped,
  txUtils.TRANSACTION_TYPES.replaced
]

export interface Transaction {
  events: string[]
  hash: string
  nonce: number | null
  replacedBy: string | null
  timestamp: number
  from: string
  actionType: string
  status: txUtils.Transaction['type'] | null
  withReceipt?: boolean
  receipt?: Receipt
}

export interface TransactionPayload {
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

export interface Arg {
  name: string
  type: string
  value: string
}

export interface Log {
  events: Arg[]
  name: string
  [key: string]: any
}

export interface Receipt {
  logs: Log[]
}
