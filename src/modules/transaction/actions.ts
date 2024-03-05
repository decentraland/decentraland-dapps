import { AnyAction } from 'redux'
import { action } from 'typesafe-actions'
import { Transaction, AnyTransaction } from './types'
import { ChainId } from '@dcl/schemas'

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
  status: AnyTransaction['status'],
  message: string,
  transaction: Transaction
) =>
  action(FETCH_TRANSACTION_FAILURE, {
    hash,
    status,
    message,
    transaction
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

// Fetch cross chain transaction

export const FETCH_CROSS_CHAIN_TRANSACTION_REQUEST =
  '[Request] Fetch Cross Transaction'
export const FETCH_CROSS_CHAIN_TRANSACTION_SUCCESS =
  '[Success] Fetch Cross Transaction'
export const FETCH_CROSS_CHAIN_TRANSACTION_FAILURE =
  '[Failure] Fetch Cross Transaction'

export const fetchCrossChainTransactionRequest = (
  address: string,
  hash: string,
  requestId: string,
  fromChain: ChainId,
  toChain: ChainId,
  actionObject: AnyAction
) =>
  action(FETCH_CROSS_CHAIN_TRANSACTION_REQUEST, {
    address,
    hash,
    fromChain,
    toChain,
    requestId,
    action: actionObject
  })

export const fetchCrossChainTransactionSuccess = (transaction: Transaction) =>
  action(FETCH_CROSS_CHAIN_TRANSACTION_SUCCESS, { transaction })

export const fetchCrossChainTransactionFailure = (
  hash: string,
  status: AnyTransaction['status'],
  message: string,
  transaction: Transaction
) =>
  action(FETCH_CROSS_CHAIN_TRANSACTION_FAILURE, {
    hash,
    status,
    message,
    transaction
  })

export type FetchCrossChainTransactionRequestAction = ReturnType<
  typeof fetchCrossChainTransactionRequest
>
export type FetchCrossChainTransactionSuccessAction = ReturnType<
  typeof fetchCrossChainTransactionSuccess
>
export type FetchCrossChainTransactionFailureAction = ReturnType<
  typeof fetchCrossChainTransactionFailure
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
  status: AnyTransaction['status'] | null
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

// Fix reverted transaction

export const FIX_REVERTED_TRANSACTION = 'Fix Reverted Transaction'

export const fixRevertedTransaction = (hash: string) =>
  action(FIX_REVERTED_TRANSACTION, { hash })

export type FixRevertedTransactionAction = ReturnType<
  typeof fixRevertedTransaction
>

// Replace transaction

export const REPLACE_TRANSACTION_REQUEST = '[Request] Replace Transaction'
export const REPLACE_TRANSACTION_SUCCESS = '[Success] Replace Transaction'
export const REPLACE_TRANSACTION_FAILURE = '[Failure] Replace Transaction'

export const replaceTransactionRequest = (
  hash: string,
  nonce: number,
  address: string
) =>
  action(REPLACE_TRANSACTION_REQUEST, {
    hash,
    nonce,
    address
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
