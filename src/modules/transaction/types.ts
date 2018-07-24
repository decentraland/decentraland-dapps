import { ActionType } from 'typesafe-actions'
import { LoadingState } from '../loading/types'
import * as actions from './actions'

// Action Types

export const FETCH_TRANSACTION_REQUEST = '[Request] Fetch Transaction'
export const FETCH_TRANSACTION_SUCCESS = '[Success] Fetch Transaction'
export const FETCH_TRANSACTION_FAILURE = '[Failure] Fetch Transaction'

export const WATCH_PENDING_TRANSACTIONS = 'Watch pending transactions'

// Interface and type definitions

export type FetchTransactionRequest = ReturnType<
  typeof actions.fetchTransactionRequest
>

export type TransactionActions = ActionType<typeof actions>

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed'
}

export interface Transaction {
  events: string[]
  hash: string
  timestamp: number
  from: string
  actionType: string
  status: TransactionStatus
}

export interface TransactionPayload {
  [hash: string]: {
    hash: string
    payload: any
    events: string[]
  }
}

export enum NetworkName {
  mainnet = 'mainnet',
  ropsten = 'ropsten',
  kovan = 'kovan',
  rinkeby = 'rinkeby'
}

export type TransactionState = {
  data: Transaction[]
  loading: LoadingState
  error: string | null
}
