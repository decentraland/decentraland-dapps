import { AnyAction } from 'redux'
import { action } from 'typesafe-actions'
import {
  FETCH_TRANSACTION_FAILURE,
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  WATCH_PENDING_TRANSACTIONS,
  Transaction
} from './types'

// Fetch transaction

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

// Watch pending transactions

export const watchPendingTransactions = () =>
  action(WATCH_PENDING_TRANSACTIONS, {})
