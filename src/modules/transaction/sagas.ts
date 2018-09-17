import { txUtils } from 'decentraland-eth'
import { call, put, select, takeEvery, ForkEffect } from 'redux-saga/effects'
import { Transaction, TransactionStatus } from './types'
import {
  fetchTransactionFailure,
  fetchTransactionSuccess,
  FETCH_TRANSACTION_REQUEST,
  WATCH_PENDING_TRANSACTIONS,
  FetchTransactionRequestAction,
  watchPendingTransactions
} from './actions'
import {
  CONNECT_WALLET_SUCCESS,
  ConnectWalletSuccessAction
} from '../wallet/actions'
import { getData, getLoading } from './selectors'

export function* transactionSaga(): IterableIterator<ForkEffect> {
  yield takeEvery(FETCH_TRANSACTION_REQUEST, handleTransactionRequest)
  yield takeEvery(WATCH_PENDING_TRANSACTIONS, handleWatchPendingTransactions)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

const watchIndex: { [hash: string]: boolean } = {
  // hash: true
}

function* handleTransactionRequest(action: FetchTransactionRequestAction) {
  const hash = action.payload.hash
  const transactions: Transaction[] = yield select(getData)
  const transaction = transactions.find(tx => tx.hash === hash)
  if (!transaction) return undefined

  try {
    watchIndex[hash] = true

    const receipt = yield call(() =>
      txUtils.getConfirmedTransaction(hash, transaction.events)
    )

    delete watchIndex[hash]

    const newTransaction: Transaction = {
      ...transaction,
      status: TransactionStatus.Confirmed,
      receipt: {
        logs: transaction.withReceipt ? receipt.receipt.logs : []
      }
    }
    yield put(fetchTransactionSuccess(newTransaction))
  } catch (error) {
    yield put(
      fetchTransactionFailure(
        { ...transaction, status: TransactionStatus.Failed },
        error.message
      )
    )
  }
}

function* handleWatchPendingTransactions() {
  const transactionRequests: Transaction[] = yield select(getLoading)

  const transactions: Transaction[] = yield select(getData)
  const pendingTransactions = transactions.filter(
    transaction => transaction.status === TransactionStatus.Pending
  )

  const allTransactions = transactionRequests.concat(pendingTransactions)

  for (const tx of allTransactions) {
    if (!watchIndex[tx.hash]) {
      const action: FetchTransactionRequestAction = {
        type: FETCH_TRANSACTION_REQUEST,
        payload: { hash: tx.hash, address: tx.from, action: { type: null } }
      }
      yield handleTransactionRequest(action)
    }
  }
}

function* handleConnectWalletSuccess(_: ConnectWalletSuccessAction) {
  yield put(watchPendingTransactions())
}
