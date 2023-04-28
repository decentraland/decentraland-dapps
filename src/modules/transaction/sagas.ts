import {
  call,
  put,
  select,
  takeEvery,
  ForkEffect,
  fork,
  delay
} from 'redux-saga/effects'
import { ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { getNetworkWeb3Provider } from '../../lib/eth'
import { Transaction, TransactionStatus, AnyTransaction } from './types'
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
  WATCH_REVERTED_TRANSACTION,
  fixRevertedTransaction
} from './actions'
import {
  CONNECT_WALLET_SUCCESS,
  ConnectWalletSuccessAction
} from '../wallet/actions'
import {
  getData,
  getTransaction as getTransactionInState,
  getTransactions
} from './selectors'
import { isPending, buildActionRef } from './utils'
import { getTransaction as getTransactionFromChain } from './txUtils'
import { getAddress } from '../wallet/selectors'

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
const REVERTED_TRANSACTION_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours
const TRANSACTION_FETCH_DELAY = 2 * 1000 // 2 seconds

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
  public status: TransactionStatus
  constructor(hash: string, status: TransactionStatus) {
    super(`[${hash}] ${status}`) // 'Error' breaks prototype chain here
    this.hash = hash
    this.status = status
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

function* handleFetchTransactionRequest(action: FetchTransactionRequestAction) {
  const { hash, address } = action.payload
  const transaction: Transaction = yield select(state =>
    getTransactionInState(state, hash)
  )
  if (!transaction) {
    console.warn(`Could not find a valid transaction for hash ${hash}`)
    return
  }

  try {
    watchPendingIndex[hash] = true

    let tx: AnyTransaction = yield call(
      getTransactionFromChain,
      address,
      transaction.chainId,
      hash
    )
    let isUnknown = tx == null

    // loop while tx is pending
    while (
      isUnknown ||
      isPending(tx.status) ||
      tx.status === TransactionStatus.REPLACED // let replaced transactions be kept in the loop so it can be picked up as dropped
    ) {
      const txInState: Transaction = yield select(state =>
        getTransactionInState(state, hash)
      )

      // update nonce
      const nonceInState = txInState == null ? null : txInState.nonce
      const nonceInNetwork = isUnknown ? null : tx.nonce

      if (nonceInNetwork != null && nonceInState == null) {
        yield put(updateTransactionNonce(hash, nonceInNetwork))
      }

      // update status
      const statusInState = txInState == null ? null : txInState.status
      const statusInNetwork = isUnknown ? null : tx.status

      const nonce = nonceInState || nonceInNetwork
      if (statusInState !== statusInNetwork && nonce != null) {
        // check if dropped or replaced
        const isDropped = statusInState != null && statusInNetwork == null
        const isReplaced = statusInNetwork === TransactionStatus.REPLACED
        if (isDropped || isReplaced) {
          // mark tx as dropped even if it was returned with a 'replaced' status, let the saga find its replacement
          yield put(replaceTransactionRequest(hash, nonce, address))
          throw new FailedTransactionError(hash, TransactionStatus.DROPPED)
        }
        yield put(updateTransactionStatus(hash, statusInNetwork))
      }

      // sleep
      yield delay(TRANSACTION_FETCH_DELAY)

      // update tx status from network
      tx = yield call(
        getTransactionFromChain,
        address,
        transaction.chainId,
        hash
      )
      isUnknown = tx == null
    }

    delete watchPendingIndex[hash]

    if (tx.status === TransactionStatus.CONFIRMED) {
      yield put(
        fetchTransactionSuccess({
          ...transaction,
          status: tx.status,
          receipt: {
            logs: transaction.withReceipt ? tx.receipt.logs : []
          }
        })
      )
    } else {
      if (tx.status === TransactionStatus.REVERTED) {
        yield put(watchRevertedTransaction(tx.hash))
      }
      throw new FailedTransactionError(tx.hash, tx.status)
    }
  } catch (error) {
    yield put(
      fetchTransactionFailure(
        error.hash,
        error.status,
        error.message,
        transaction
      )
    )
  }
}

function* handleReplaceTransactionRequest(
  action: ReplaceTransactionRequestAction
) {
  const { hash, nonce, address: account } = action.payload
  const transaction: Transaction = yield select(state =>
    getTransactionInState(state, hash)
  )
  if (!transaction) {
    console.warn(`Could not find a valid transaction for hash ${hash}`)
    return
  }

  let checkpoint = null
  watchDroppedIndex[hash] = true

  while (true) {
    const eth: ethers.providers.Web3Provider = yield call(
      getNetworkWeb3Provider,
      transaction.chainId
    )

    // check if tx has status, this is to recover from a tx that is dropped momentarily
    const tx: AnyTransaction = yield call(
      getTransactionFromChain,
      account,
      transaction.chainId,
      hash
    )

    if (tx != null) {
      const txInState: Transaction = yield select(state =>
        getTransactionInState(state, hash)
      )
      yield put(
        fetchTransactionRequest(account, hash, buildActionRef(txInState))
      )
      break
    }

    // get latest block
    const blockNumber: number = yield call([eth, 'getBlockNumber'])

    let highestNonce = 0
    let replacedBy = null

    // loop through the last blocks
    const startBlock = blockNumber
    const endBlock = checkpoint || blockNumber - BLOCKS_DEPTH
    for (let i = startBlock; i > endBlock; i--) {
      let block: BlockWithTransactions = yield call(
        [eth, 'getBlockWithTransactions'],
        i
      )
      const transactions: TransactionResponse[] =
        block != null && block.transactions != null ? block.transactions : []

      // look for a replacement tx, if so break the loop
      replacedBy = transactions.find(
        tx => tx.nonce === nonce && tx.from.toString() === account
      )
      if (replacedBy) break

      // if no replacement is found, keep track of the highest nonce for the account
      highestNonce = transactions
        .filter(tx => tx.from.toString() === account)
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
          getTransactionInState(state, hash)
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
        updateTransactionStatus(action.payload.hash, TransactionStatus.REPLACED)
      )
      break
    }

    // sleep
    yield delay(TRANSACTION_FETCH_DELAY)
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
        yield put(updateTransactionStatus(tx.hash, TransactionStatus.DROPPED))
      }
    }
  }
}

function* handleWatchDroppedTransactions() {
  const transactions: Transaction[] = yield select(getData)
  const droppedTransactions = transactions.filter(
    transaction =>
      transaction.status === TransactionStatus.DROPPED &&
      transaction.nonce != null
  )

  for (const tx of droppedTransactions) {
    if (!watchDroppedIndex[tx.hash]) {
      yield fork(
        handleReplaceTransactionRequest,
        replaceTransactionRequest(tx.hash, tx.nonce as number, tx.from)
      )
    }
  }
}

function* handleWatchRevertedTransaction(
  action: WatchRevertedTransactionAction
) {
  const { hash } = action.payload

  const txInState: Transaction = yield select(state =>
    getTransactionInState(state, hash)
  )
  const address: string = yield select(state => getAddress(state))

  do {
    yield delay(TRANSACTION_FETCH_DELAY)
    const txInNetwork: AnyTransaction | null = yield call(() =>
      getTransactionFromChain(address, txInState.chainId, hash)
    )
    if (
      txInNetwork != null &&
      txInNetwork.status === TransactionStatus.CONFIRMED
    ) {
      yield put(fixRevertedTransaction(hash))
      return
    } else if (txInNetwork == null && txInState.nonce) {
      yield put(
        replaceTransactionRequest(hash, txInState.nonce, txInState.from)
      )
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
      transaction.status === TransactionStatus.REVERTED &&
      !isExpired(transaction, REVERTED_TRANSACTION_THRESHOLD)
  )
  for (const transaction of revertedTransactions) {
    yield put(watchRevertedTransaction(transaction.hash))
  }
}
