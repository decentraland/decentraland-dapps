import { eth, txUtils } from 'decentraland-eth'
import {
  call,
  put,
  select,
  takeEvery,
  ForkEffect,
  fork
} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Transaction } from './types'
import {
  fetchTransactionFailure,
  fetchTransactionSuccess,
  FETCH_TRANSACTION_REQUEST,
  WATCH_PENDING_TRANSACTIONS,
  FetchTransactionRequestAction,
  watchPendingTransactions,
  updateTransactionStatus,
  updateTransactionNonce,
  ReplaceTransactionRequestAction,
  replaceTransactionRequest,
  watchDroppedTransactions,
  WATCH_DROPPED_TRANSACTIONS,
  replaceTransactionSuccess,
  REPLACE_TRANSACTION_REQUEST,
  fetchTransactionRequest,
  watchRevertedTransaction,
  WatchRevertedTransactionAction,
  WATCH_REVERTED_TRANSACTION
} from './actions'
import {
  CONNECT_WALLET_SUCCESS,
  ConnectWalletSuccessAction
} from '../wallet/actions'
import { getData, getTransaction, getTransactions } from './selectors'
import { isPending, buildActionRef } from './utils'
import { TransactionStatus } from 'decentraland-eth/dist/ethereum/wallets/Wallet'
import { getAddress } from '../wallet/selectors'

const { TRANSACTION_TYPES } = txUtils

export function* transactionSaga(): IterableIterator<ForkEffect> {
  yield takeEvery(FETCH_TRANSACTION_REQUEST, handleFetchTransactionRequest)
  yield takeEvery(REPLACE_TRANSACTION_REQUEST, handleReplaceTransactionRequest)
  yield takeEvery(WATCH_PENDING_TRANSACTIONS, handleWatchPendingTransactions)
  yield takeEvery(WATCH_DROPPED_TRANSACTIONS, handleWatchDroppedTransactions)
  yield takeEvery(WATCH_REVERTED_TRANSACTION, handleWatchRevertedTransaction)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

const BLOCKS_DEPTH = 100
const PENDING_TRANSACTION_THRESHOLD = 72 * 60 * 60 * 1000 // 72 hours
const REVERTED_TRANSACTION_THRESHOLD = 60 * 60 * 1000 // 1 hour

const isExpired = (transaction: Transaction, threshold: number) =>
  Date.now() - transaction.timestamp > threshold

const watchPendingIndex: { [hash: string]: boolean } = {
  // hash: true
}

const watchDroppedIndex: { [hash: string]: boolean } = {
  // hash: true
}

export class FailedTransactionError extends Error {
  public hash: string
  public status: txUtils.Transaction['type']
  constructor(hash: string, status: txUtils.Transaction['type']) {
    super(`[${hash}] ${status}`) // 'Error' breaks prototype chain here
    this.hash = hash
    this.status = status
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

function* handleFetchTransactionRequest(action: FetchTransactionRequestAction) {
  const hash = action.payload.hash
  const transactions: Transaction[] = yield select(getData)
  const transaction = transactions.find(tx => tx.hash === hash)
  if (!transaction) return undefined

  try {
    watchPendingIndex[hash] = true

    let tx: txUtils.Transaction = yield call(() => txUtils.getTransaction(hash))
    let isUnknown = tx == null

    // loop while tx is pending
    while (
      isUnknown ||
      isPending(tx.type) ||
      tx.type === TRANSACTION_TYPES.replaced // let replaced transactions be kept in the loop so it can be picked up as dropped
    ) {
      const txInState: Transaction = yield select(state =>
        getTransaction(state, hash)
      )

      // update nonce
      const nonceInState = txInState == null ? null : txInState.nonce
      const nonceInNetwork = isUnknown ? null : tx.nonce

      if (nonceInNetwork != null && nonceInState == null) {
        yield put(updateTransactionNonce(hash, nonceInNetwork))
      }

      // update status
      const statusInState = txInState == null ? null : txInState.status
      const statusInNetwork = isUnknown ? null : tx.type

      const nonce = nonceInState || nonceInNetwork
      if (statusInState !== statusInNetwork && nonce != null) {
        // check if dropped or replaced
        const isDropped = statusInState != null && statusInNetwork == null
        const isReplaced = statusInNetwork === TRANSACTION_TYPES.replaced
        if (isDropped || isReplaced) {
          // mark tx as dropped even if it was returned with a 'replaced' status, let the saga find its replacement
          yield put(replaceTransactionRequest(hash, nonce))
          throw new FailedTransactionError(hash, TRANSACTION_TYPES.dropped)
        }
        yield put(updateTransactionStatus(hash, statusInNetwork))
      }

      // sleep
      yield call(delay, txUtils.TRANSACTION_FETCH_DELAY)

      // update tx status from network
      tx = yield call(() => txUtils.getTransaction(hash))
      isUnknown = tx == null
    }

    delete watchPendingIndex[hash]

    if (tx.type === TRANSACTION_TYPES.confirmed) {
      yield put(
        fetchTransactionSuccess({
          ...transaction,
          status: tx.type,
          receipt: {
            logs: transaction.withReceipt ? tx.receipt.logs : []
          }
        })
      )
    } else {
      if (tx.type === TRANSACTION_TYPES.reverted) {
        yield put(watchRevertedTransaction(tx.hash))
      }
      throw new FailedTransactionError(tx.hash, tx.type)
    }
  } catch (error) {
    yield put(fetchTransactionFailure(error.hash, error.status, error.message))
  }
}

function* handleReplaceTransactionRequest(
  action: ReplaceTransactionRequestAction
) {
  const account = eth.getAccount()
  const { hash, nonce } = action.payload

  watchDroppedIndex[hash] = true

  let checkpoint = null

  while (true) {
    // check if tx has status, this is to recover from a tx that is dropped momentarily
    const tx: txUtils.Transaction = yield call(() =>
      txUtils.getTransaction(hash)
    )
    if (tx != null) {
      const txInState: Transaction = yield select(state =>
        getTransaction(state, hash)
      )
      yield put(
        fetchTransactionRequest(account, hash, buildActionRef(txInState))
      )
      break
    }

    // get latest block
    const blockNumber = yield call(() => eth.getBlockNumber())

    let highestNonce = 0
    let replacedBy = null

    // loop through the last blocks
    const startBlock = blockNumber
    const endBlock = checkpoint || blockNumber - BLOCKS_DEPTH
    for (let i = startBlock; i > endBlock; i--) {
      let block = yield call(() => eth.getBlock(i, true))
      const transactions: TransactionStatus[] =
        block != null && block.transactions != null ? block.transactions : []

      // look for a replacement tx, if so break the loop
      replacedBy = transactions.find(
        tx => tx.nonce === nonce && tx.from === account
      )
      if (replacedBy) break

      // if no replacement is found, keep track of the highest nonce for the account
      highestNonce = transactions
        .filter(tx => tx.from === account)
        .reduce((max, tx) => Math.max(max, tx.nonce), highestNonce)
    }

    checkpoint = blockNumber

    // if a replacement tx was found, replace it
    if (replacedBy) {
      // this is a tx that was wrongly marked as replaced
      // could be due to a race condition when fetching the account nonce
      // it will be sent back to the pending tx saga that will mark it as confirmed/reverted
      if (hash === replacedBy.hash) {
        const txInState: Transaction = yield select(state =>
          getTransaction(state, hash)
        )
        yield put(
          fetchTransactionRequest(account, hash, buildActionRef(txInState))
        )
      } else {
        // replacement found!
        yield put(replaceTransactionSuccess(hash, replacedBy.hash))
      }
      break
    }

    // if there was nonce higher to than the one in the tx, we can mark it as replaced (altough we don't know which tx replaced it)
    if (highestNonce >= nonce) {
      yield put(
        updateTransactionStatus(action.payload.hash, TRANSACTION_TYPES.replaced)
      )
      break
    }

    // sleep
    yield call(delay, txUtils.TRANSACTION_FETCH_DELAY)
  }

  delete watchDroppedIndex[action.payload.hash]
}

function* handleWatchPendingTransactions() {
  const transactions: Transaction[] = yield select(getData)
  const pendingTransactions = transactions.filter(transaction =>
    isPending(transaction.status)
  )

  for (const tx of pendingTransactions) {
    if (!watchPendingIndex[tx.hash]) {
      // don't watch transactions that are too old
      if (!isExpired(tx, PENDING_TRANSACTION_THRESHOLD)) {
        yield fork(
          handleFetchTransactionRequest,
          fetchTransactionRequest(tx.from, tx.hash, buildActionRef(tx))
        )
      } else {
        // mark it as dropped if it's too old
        yield put(updateTransactionStatus(tx.hash, TRANSACTION_TYPES.dropped))
      }
    }
  }
}

function* handleWatchDroppedTransactions() {
  const transactions: Transaction[] = yield select(getData)
  const droppedTransactions = transactions.filter(
    transaction =>
      transaction.status === TRANSACTION_TYPES.dropped &&
      transaction.nonce != null
  )

  for (const tx of droppedTransactions) {
    if (!watchDroppedIndex[tx.hash]) {
      yield fork(
        handleReplaceTransactionRequest,
        replaceTransactionRequest(tx.hash, tx.nonce as number)
      )
    }
  }
}

function* handleWatchRevertedTransaction(
  action: WatchRevertedTransactionAction
) {
  const { hash } = action.payload

  const txInState: Transaction = yield select(state =>
    getTransaction(state, hash)
  )

  if (txInState.status !== TRANSACTION_TYPES.reverted) {
    return
  }

  do {
    yield call(delay, txUtils.TRANSACTION_FETCH_DELAY)
    const tx: txUtils.Transaction | null = yield call(() =>
      txUtils.getTransaction(hash)
    )
    if (tx != null && tx.type === TRANSACTION_TYPES.confirmed) {
      yield put(updateTransactionStatus(hash, TRANSACTION_TYPES.confirmed))
      return
    }
  } while (!isExpired(txInState, REVERTED_TRANSACTION_THRESHOLD))
}

function* handleConnectWalletSuccess(_: ConnectWalletSuccessAction) {
  yield put(watchPendingTransactions())
  yield put(watchDroppedTransactions())

  // find reverted transactions and watch the latest ones
  const address: string = yield select(state => getAddress(state))
  const transactions: Transaction[] = yield select(state =>
    getTransactions(state, address)
  )
  const revertedTransactions = transactions.filter(
    transaction =>
      transaction.status === TRANSACTION_TYPES.reverted &&
      !isExpired(transaction, REVERTED_TRANSACTION_THRESHOLD)
  )
  for (const transaction of revertedTransactions) {
    yield put(watchRevertedTransaction(transaction.hash))
  }
}
