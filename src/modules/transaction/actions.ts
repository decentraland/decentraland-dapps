import { AnyAction } from 'redux'
import { action } from 'typesafe-actions'
import { Transaction } from './types'
import { txUtils } from 'decentraland-eth'

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
  hash: string,
  status: txUtils.Transaction['type'],
  message: string
) =>
  action(FETCH_TRANSACTION_FAILURE, {
    hash,
    status,
    message
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

export const WATCH_PENDING_TRANSACTIONS = 'Watch Pending Transactions'

export const watchPendingTransactions = () =>
  action(WATCH_PENDING_TRANSACTIONS, {})

export type WatchPendingTransactionsAction = ReturnType<
  typeof watchPendingTransactions
>

// Update transaction status

export const UPDATE_TRANSACTION_STATUS = 'Update Transaction Status'

export const updateTransactionStatus = (
  hash: string,
  status: txUtils.Transaction['type'] | null
) => action(UPDATE_TRANSACTION_STATUS, { hash, status })

export type UpdateTransactionStatusAction = ReturnType<
  typeof updateTransactionStatus
>

// Update transaction nonce

export const UPDATE_TRANSACTION_NONCE = 'Update Transaction Nonce'

export const updateTransactionNonce = (hash: string, nonce: number) =>
  action(UPDATE_TRANSACTION_NONCE, { hash, nonce })

export type UpdateTransactionNonceAction = ReturnType<
  typeof updateTransactionNonce
>

// Watch dropped transactions

export const WATCH_DROPPED_TRANSACTIONS = 'Watch Dropped Transactions'

export const watchDroppedTransactions = () =>
  action(WATCH_DROPPED_TRANSACTIONS, {})

export type WatchDroppedTransactionsAction = ReturnType<
  typeof watchDroppedTransactions
>

// Watch reverted transaction

export const WATCH_REVERTED_TRANSACTION = 'Watch Reverted Transaction'

export const watchRevertedTransaction = (hash: string) =>
  action(WATCH_REVERTED_TRANSACTION, { hash })

export type WatchRevertedTransactionAction = ReturnType<
  typeof watchRevertedTransaction
>

// Replace transaction

export const REPLACE_TRANSACTION_REQUEST = '[Request] Replace Transaction'
export const REPLACE_TRANSACTION_SUCCESS = '[Success] Replace Transaction'
export const REPLACE_TRANSACTION_FAILURE = '[Failure] Replace Transaction'

export const replaceTransactionRequest = (hash: string, nonce: number) =>
  action(REPLACE_TRANSACTION_REQUEST, {
    hash,
    nonce
  })

export const replaceTransactionSuccess = (hash: string, replaceBy: string) =>
  action(REPLACE_TRANSACTION_SUCCESS, { hash, replaceBy })

export const replaceTransactionFailure = (hash: string, error: string) =>
  action(REPLACE_TRANSACTION_FAILURE, {
    hash,
    error
  })

export type ReplaceTransactionRequestAction = ReturnType<
  typeof replaceTransactionRequest
>
export type ReplaceTransactionSuccessAction = ReturnType<
  typeof replaceTransactionSuccess
>
export type ReplaceTransactionFailureAction = ReturnType<
  typeof replaceTransactionFailure
>

// Clear Transactions (multiple)

export const CLEAR_TRANSACTIONS = 'Clear Transactions'

export const clearTransactions = (
  address: string,
  clearPendings: boolean = false
) =>
  action(CLEAR_TRANSACTIONS, {
    address,
    clearPendings
  })

export type ClearTransactionsAction = ReturnType<typeof clearTransactions>

// Clear Transaction (single)

export const CLEAR_TRANSACTION = 'Clear Transaction'

export const clearTransaction = (hash: string) =>
  action(CLEAR_TRANSACTION, {
    hash
  })

export type ClearTransactionAction = ReturnType<typeof clearTransaction>
