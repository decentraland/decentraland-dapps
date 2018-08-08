import { TransactionStatus, Transaction } from './types'
import { getTransactionFromAction } from './utils'
import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  FetchTransactionRequestAction,
  FetchTransactionSuccessAction,
  FetchTransactionFailureAction,
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  FETCH_TRANSACTION_FAILURE
} from './actions'

export type TransactionState = {
  data: Transaction[]
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: TransactionState = {
  data: [],
  loading: [],
  error: null
}

export type TransactionReducerAction =
  | FetchTransactionRequestAction
  | FetchTransactionSuccessAction
  | FetchTransactionFailureAction

export function transactionReducer(
  state = INITIAL_STATE,
  action: TransactionReducerAction
): TransactionState {
  switch (action.type) {
    case FETCH_TRANSACTION_REQUEST: {
      const actionRef = action.payload.action
      const transaction = getTransactionFromAction(actionRef)
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: [
          ...state.data,
          {
            ...transaction,
            timestamp: Date.now(),
            from: action.payload.address,
            actionType: actionRef.type,
            status: TransactionStatus.Pending
          }
        ]
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const actionTransaction = action.payload.transaction
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: state.data.map(
          (transaction: Transaction) =>
            // prettier-ignore
            actionTransaction.hash === transaction.hash
              ? {
                ...transaction,
                ...actionTransaction,
                status: TransactionStatus.Confirmed
              }
              : transaction
        )
      }
    }
    case FETCH_TRANSACTION_FAILURE: {
      const actionTransaction = action.payload.transaction
      return {
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
        data: state.data.map(
          (transaction: Transaction) =>
            // prettier-ignore
            actionTransaction.hash === transaction.hash
              ? {
                ...transaction,
                ...actionTransaction,
                status: TransactionStatus.Failed,
                error: action.payload.error
              }
              : transaction
        )
      }
    }
    default:
      return state
  }
}
