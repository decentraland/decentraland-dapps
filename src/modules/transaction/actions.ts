import { AnyAction } from 'redux'
import { action } from 'typesafe-actions'
import { Transaction } from './types'

// Fetch transaction

export const FETCH_TRANSACTION_REQUEST = '[Request] Fetch Transaction'
export const FETCH_TRANSACTION_SUCCESS = '[Success] Fetch Transaction'
export const FETCH_TRANSACTION_FAILURE = '[Failure] Fetch Transaction'

export const fetchTransactionRequest = (
  address: string,
  hash: string,
  actionObject: AnyAction
) =>
  action(FETCH_TRANSACTION_REQUEST, {
    address,
    hash,
    action: actionObject
  })

export const fetchTransactionSuccess = (transaction: Transaction) =>
  action(FETCH_TRANSACTION_SUCCESS, { transaction })

export const fetchTransactionFailure = (
  transaction: Transaction,
  error: string
) =>
  action(FETCH_TRANSACTION_FAILURE, {
    transaction,
    error
  })

export type FetchTransactionRequestAction = ReturnType<
  typeof fetchTransactionRequest
>
export type FetchTransactionSuccessAction = ReturnType<
  typeof fetchTransactionSuccess
>
export type FetchTransactionFailureAction = ReturnType<
  typeof fetchTransactionFailure
>

// Watch pending transactions

export const WATCH_PENDING_TRANSACTIONS = 'Watch pending transactions'

export const watchPendingTransactions = () =>
  action(WATCH_PENDING_TRANSACTIONS, {})

export type WatchPendingTransactionsAction = ReturnType<
  typeof fetchTransactionFailure
>
