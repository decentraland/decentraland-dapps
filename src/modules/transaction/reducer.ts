import { Transaction, TransactionStatus } from './types'
import { getTransactionFromAction, isPending } from './utils'
import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  FetchTransactionRequestAction,
  FetchTransactionSuccessAction,
  FetchTransactionFailureAction,
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  FETCH_TRANSACTION_FAILURE,
  UPDATE_TRANSACTION_STATUS,
  UpdateTransactionStatusAction,
  UPDATE_TRANSACTION_NONCE,
  UpdateTransactionNonceAction,
  REPLACE_TRANSACTION_SUCCESS,
  ReplaceTransactionSuccessAction,
  ClearTransactionsAction,
  ClearTransactionAction,
  CLEAR_TRANSACTIONS,
  CLEAR_TRANSACTION,
  FixRevertedTransactionAction,
  FIX_REVERTED_TRANSACTION
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
  | UpdateTransactionStatusAction
  | UpdateTransactionNonceAction
  | ReplaceTransactionSuccessAction
  | FixRevertedTransactionAction
  | ClearTransactionsAction
  | ClearTransactionAction

export function transactionReducer(
  state = INITIAL_STATE,
  action: TransactionReducerAction
): TransactionState {
  switch (action.type) {
    case FETCH_TRANSACTION_REQUEST: {
      const actionRef = action.payload.action
      const transaction = getTransactionFromAction(actionRef)
      const otherTransactions = state.data.filter(
        otherTransaction => otherTransaction.hash !== transaction.hash
      )
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: [
          ...otherTransactions,
          {
            ...transaction,
            timestamp: Date.now(),
            from: action.payload.address.toLowerCase(),
            actionType: actionRef.type,
            // these always start as null, and they get updated by the saga
            status: null,
            nonce: null,
            replacedBy: null
          }
        ]
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const actionTransaction = action.payload.transaction
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: state.data.map((transaction: Transaction) =>
          // prettier-ignore
          actionTransaction.hash === transaction.hash
              ? {
                ...transaction,
                ...actionTransaction
              }
              : transaction
        )
      }
    }
    case FETCH_TRANSACTION_FAILURE: {
      const { hash, status, message } = action.payload
      return {
        loading: loadingReducer(state.loading, action),
        error: message,
        data: state.data.map((transaction: Transaction) =>
          // prettier-ignore
          hash === transaction.hash
              ? {
                ...transaction,
                status
              }
              : transaction
        )
      }
    }
    case UPDATE_TRANSACTION_STATUS: {
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: state.data.map((transaction: Transaction) =>
          // prettier-ignore
          action.payload.hash === transaction.hash
              ? {
                ...transaction,
                status: action.payload.status
              }
              : transaction
        )
      }
    }
    case FIX_REVERTED_TRANSACTION: {
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: state.data.map((transaction: Transaction) =>
          // prettier-ignore
          action.payload.hash === transaction.hash
              ? {
                ...transaction,
                status: TransactionStatus.CONFIRMED
              }
              : transaction
        )
      }
    }
    case UPDATE_TRANSACTION_NONCE: {
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: state.data.map((transaction: Transaction) =>
          action.payload.hash === transaction.hash
            ? {
                ...transaction,
                nonce: action.payload.nonce
              }
            : transaction
        )
      }
    }
    case REPLACE_TRANSACTION_SUCCESS: {
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: state.data.map((transaction: Transaction) =>
          action.payload.hash === transaction.hash
            ? {
                ...transaction,
                status: TransactionStatus.REPLACED,
                replacedBy: action.payload.replaceBy
              }
            : transaction
        )
      }
    }
    case CLEAR_TRANSACTIONS: {
      return {
        ...state,
        data: state.data.filter(
          transaction =>
            transaction.from.toLowerCase() !==
              action.payload.address.toLowerCase() &&
            (action.payload.clearPendings || !isPending(transaction.status))
        )
      }
    }
    case CLEAR_TRANSACTION: {
      return {
        ...state,
        data: state.data.filter(
          transaction => transaction.hash !== action.payload.hash
        )
      }
    }
    default:
      return state
  }
}
