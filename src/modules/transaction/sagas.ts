import type { BlockWithTransactions } from '@ethersproject/abstract-provider'
import type { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { ForkEffect, call, delay, fork, put, select, takeEvery } from 'redux-saga/effects'
import type { StatusResponse } from 'decentraland-transactions/esm/crossChain/types'
import { getNetworkWeb3Provider } from '../../lib/eth'
import { CONNECT_WALLET_SUCCESS, ConnectWalletSuccessAction } from '../wallet/actions'
import { getAddress } from '../wallet/selectors'
import {
  FETCH_TRANSACTION_REQUEST,
  FetchTransactionRequestAction,
  REPLACE_TRANSACTION_REQUEST,
  ReplaceTransactionRequestAction,
  WATCH_DROPPED_TRANSACTIONS,
  WATCH_PENDING_TRANSACTIONS,
  WATCH_REVERTED_TRANSACTION,
  WatchRevertedTransactionAction,
  fetchTransactionFailure,
  fetchTransactionRequest,
  fetchTransactionSuccess,
  fixRevertedTransaction,
  replaceTransactionRequest,
  replaceTransactionSuccess,
  updateTransactionNonce,
  updateTransactionStatus,
  watchDroppedTransactions,
  watchPendingTransactions,
  watchRevertedTransaction
} from './actions'
import { getData, getTransaction as getTransactionInState, getTransactions } from './selectors'
import { getTransaction as getTransactionFromChain } from './txUtils'
import { AnyTransaction, Transaction, TransactionStatus, TransactionsConfig } from './types'
import { buildActionRef, getTransactionPayloadFromAction, isPending, isTransactionActionCrossChain } from './utils'

export function* transactionSaga(config?: TransactionsConfig): IterableIterator<ForkEffect> {
  yield takeEvery(FETCH_TRANSACTION_REQUEST, handleFetchTransactionRequest)
  yield takeEvery(REPLACE_TRANSACTION_REQUEST, handleReplaceTransactionRequest)
  yield takeEvery(WATCH_PENDING_TRANSACTIONS, handleWatchPendingTransactions)
  yield takeEvery(WATCH_DROPPED_TRANSACTIONS, handleWatchDroppedTransactions)
  yield takeEvery(WATCH_REVERTED_TRANSACTION, handleWatchRevertedTransaction)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)

  function* handleFetchTransactionRequest(action: FetchTransactionRequestAction) {
    const isCrossChain = isTransactionActionCrossChain(action.payload.action)
    if (isCrossChain) {
      yield call(handleCrossChainTransactionRequest, action, config)
    } else {
      yield call(handleRegularTransactionRequest, action)
    }
  }
}

export const BLOCKS_DEPTH = 100
export const TRANSACTION_FETCH_RETIES = 120
export const PENDING_TRANSACTION_THRESHOLD = 72 * 60 * 60 * 1000 // 72 hours
export const REVERTED_TRANSACTION_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours
export const DROPPED_TRANSACTION_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours
export const BACKOFF_DELAY_MULTIPLIER = 1

const isExpired = (transaction: Transaction, threshold: number) => Date.now() - transaction.timestamp > threshold

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

export function* handleCrossChainTransactionRequest(action: FetchTransactionRequestAction, config?: TransactionsConfig) {
  const transactionPayload = getTransactionPayloadFromAction(action.payload.action)

  if (!config?.crossChainProviderUrl || !transactionPayload.requestId) {
    throw new Error('Squid URL not set')
  }

  const CrossChainProvider: Awaited<ReturnType<typeof config.getCrossChainProvider>> = yield config.getCrossChainProvider()
  const crossChainProvider = new CrossChainProvider(config.crossChainProviderUrl)

  let statusResponse: StatusResponse | undefined
  let txInState: Transaction
  let attempt = 0
  let squidNotFoundRetries: number = config.crossChainProviderNotFoundRetries ?? TRANSACTION_FETCH_RETIES
  while (!statusResponse || statusResponse.squidTransactionStatus === 'ongoing' || statusResponse.squidTransactionStatus === 'not_found') {
    // wrapping in try-catch since it throws an error if the tx is not found (the first seconds after triggering it)
    try {
      statusResponse = yield call([crossChainProvider, 'getStatus'], transactionPayload.requestId, transactionPayload.hash)
      txInState = yield select(state => getTransactionInState(state, action.payload.hash))
      if (statusResponse && statusResponse.squidTransactionStatus === 'ongoing' && txInState.status !== TransactionStatus.PENDING) {
        yield put(updateTransactionStatus(action.payload.hash, TransactionStatus.PENDING))
      } else if (statusResponse && statusResponse.squidTransactionStatus === 'not_found') {
        squidNotFoundRetries--
      }
    } catch {
      squidNotFoundRetries--
    }

    if (squidNotFoundRetries <= 0 && (!statusResponse || statusResponse.squidTransactionStatus === 'not_found')) {
      yield put(updateTransactionStatus(action.payload.hash, TransactionStatus.DROPPED))
      return
    }

    const fibonacciDelay: number = yield call(getFibonacciDelay, attempt)
    yield delay(config.crossChainProviderRetryDelay ?? fibonacciDelay)
    attempt++
  }

  txInState = yield select(state => getTransactionInState(state, action.payload.hash))
  switch (statusResponse.squidTransactionStatus) {
    case 'success':
      yield put(
        fetchTransactionSuccess({
          ...txInState,
          status: TransactionStatus.CONFIRMED
        })
      )
      break
    case 'partial_success':
    case 'needs_gas':
      const error = (statusResponse.error ?? `Transaction errored due to: ${statusResponse.squidTransactionStatus}`).toString()
      yield put(fetchTransactionFailure(action.payload.hash, TransactionStatus.REVERTED, error, txInState))
      break
  }
}

export function* handleRegularTransactionRequest(action: FetchTransactionRequestAction) {
  const { hash, address } = action.payload
  const transaction: Transaction = yield select(state => getTransactionInState(state, hash))
  if (!transaction) {
    console.warn(`Could not find a valid transaction for hash ${hash}`)
    return
  }

  try {
    watchPendingIndex[hash] = true
    let attempt = 0

    let tx: AnyTransaction = yield call(getTransactionFromChain, address, transaction.chainId, hash)
    let isUnknown = tx == null

    // loop while tx is pending
    while (
      isUnknown ||
      isPending(tx.status) ||
      tx.status === TransactionStatus.REPLACED // let replaced transactions be kept in the loop so it can be picked up as dropped
    ) {
      const txInState: Transaction = yield select(state => getTransactionInState(state, hash))

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

      // Apply fibonacci backoff delay before next iteration
      const fibonacciDelay: number = yield call(getFibonacciDelay, attempt)
      yield delay(fibonacciDelay)
      attempt++

      // update tx status from network
      tx = yield call(getTransactionFromChain, address, transaction.chainId, hash)
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
    yield put(fetchTransactionFailure(error.hash, error.status, error.message, transaction))
  }
}

export function* getFibonacciDelay(attempt: number) {
  if (attempt <= 1) return 1000 * BACKOFF_DELAY_MULTIPLIER

  let prev = 1
  let current = 1
  for (let i = 2; i <= attempt; i++) {
    const next = prev + current
    prev = current
    current = next
  }
  return current * 1000 * BACKOFF_DELAY_MULTIPLIER
}

export function* handleReplaceTransactionRequest(action: ReplaceTransactionRequestAction) {
  const { hash, nonce, address: account } = action.payload
  const transaction: Transaction = yield select(state => getTransactionInState(state, hash))
  if (!transaction) {
    console.warn(`Could not find a valid transaction for hash ${hash}`)
    return
  }

  // Check if transaction is already expired before starting to poll
  if (isExpired(transaction, DROPPED_TRANSACTION_THRESHOLD)) {
    yield put(updateTransactionStatus(hash, TransactionStatus.DROPPED))
    return
  }

  let checkpoint = null
  let attempt = 0
  watchDroppedIndex[hash] = true

  const startTime = Date.now()

  while (true) {
    // Check if we've exceeded the time threshold during polling
    if (Date.now() - startTime > DROPPED_TRANSACTION_THRESHOLD) {
      yield put(updateTransactionStatus(hash, TransactionStatus.DROPPED))
      break
    }

    const eth: Web3Provider = yield call(getNetworkWeb3Provider, transaction.chainId)

    // check if tx has status, this is to recover from a tx that is dropped momentarily
    const tx: AnyTransaction = yield call(getTransactionFromChain, account, transaction.chainId, hash)

    if (tx != null) {
      const txInState: Transaction = yield select(state => getTransactionInState(state, hash))
      yield put(fetchTransactionRequest(account, hash, buildActionRef(txInState)))
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
      const block: BlockWithTransactions = yield call([eth, 'getBlockWithTransactions'], i)
      const transactions: TransactionResponse[] = block != null && block.transactions != null ? block.transactions : []

      // look for a replacement tx, if so break the loop
      replacedBy = transactions.find(tx => tx.nonce === nonce && tx.from.toString() === account)
      if (replacedBy) break

      // if no replacement is found, keep track of the highest nonce for the account
      highestNonce = transactions.filter(tx => tx.from.toString() === account).reduce((max, tx) => Math.max(max, tx.nonce), highestNonce)
    }

    checkpoint = blockNumber

    // if a replacement tx was found, replace it
    if (replacedBy) {
      // this is a tx that was wrongly marked as replaced
      // could be due to a race condition when fetching the account nonce
      // it will be sent back to the pending tx saga that will mark it as confirmed/reverted
      if (hash === replacedBy.hash) {
        const txInState: Transaction = yield select(state => getTransactionInState(state, hash))
        yield put(fetchTransactionRequest(account, hash, buildActionRef(txInState)))
      } else {
        // replacement found!
        yield put(replaceTransactionSuccess(hash, replacedBy.hash))
      }
      break
    }

    // if there was nonce higher to than the one in the tx, we can mark it as replaced (although we don't know which tx replaced it)
    if (highestNonce >= nonce) {
      yield put(updateTransactionStatus(action.payload.hash, TransactionStatus.REPLACED))
      break
    }

    // Apply fibonacci backoff delay before next iteration
    const fibonacciDelay: number = yield call(getFibonacciDelay, attempt)
    yield delay(fibonacciDelay)
    attempt++
  }

  delete watchDroppedIndex[action.payload.hash]
}

export function* handleWatchPendingTransactions() {
  const transactions: Transaction[] = yield select(getData)
  const pendingTransactions = transactions.filter(transaction => isPending(transaction.status))

  for (const tx of pendingTransactions) {
    if (!watchPendingIndex[tx.hash]) {
      // don't watch transactions that are too old
      if (!isExpired(tx, PENDING_TRANSACTION_THRESHOLD)) {
        yield fork(handleRegularTransactionRequest, fetchTransactionRequest(tx.from, tx.hash, buildActionRef(tx)))
      } else {
        // mark it as dropped if it's too old
        yield put(updateTransactionStatus(tx.hash, TransactionStatus.DROPPED))
      }
    }
  }
}

export function* handleWatchDroppedTransactions() {
  const transactions: Transaction[] = yield select(getData)
  const droppedTransactions = transactions.filter(
    transaction =>
      transaction.status === TransactionStatus.DROPPED &&
      transaction.nonce != null &&
      !isExpired(transaction, DROPPED_TRANSACTION_THRESHOLD)
  )

  for (const tx of droppedTransactions) {
    if (!watchDroppedIndex[tx.hash] && !tx.isCrossChain) {
      yield fork(handleReplaceTransactionRequest, replaceTransactionRequest(tx.hash, tx.nonce as number, tx.from))
    }
  }
}

export function* handleWatchRevertedTransaction(action: WatchRevertedTransactionAction) {
  const { hash } = action.payload

  const txInState: Transaction = yield select(state => getTransactionInState(state, hash))

  // Don't watch for reverted cross chain transactions
  if (txInState.isCrossChain) {
    return
  }

  const address: string = yield select(state => getAddress(state))
  let attempt = 0

  do {
    const fibonacciDelay: number = yield call(getFibonacciDelay, attempt)
    yield delay(fibonacciDelay)
    attempt++

    const txInNetwork: AnyTransaction | null = yield call(() => getTransactionFromChain(address, txInState.chainId, hash))
    if (txInNetwork != null && txInNetwork.status === TransactionStatus.CONFIRMED) {
      yield put(fixRevertedTransaction(hash))
      return
    } else if (txInNetwork == null && txInState.nonce) {
      yield put(replaceTransactionRequest(hash, txInState.nonce, txInState.from))
      return
    }
  } while (!isExpired(txInState, REVERTED_TRANSACTION_THRESHOLD))
}

export function* handleConnectWalletSuccess(_: ConnectWalletSuccessAction) {
  yield put(watchPendingTransactions())
  yield put(watchDroppedTransactions())

  // find reverted transactions and watch the latest ones
  const address: string = yield select(state => getAddress(state))
  const transactions: Transaction[] = yield select(state => getTransactions(state, address))
  const revertedTransactions = transactions.filter(
    transaction => transaction.status === TransactionStatus.REVERTED && !isExpired(transaction, REVERTED_TRANSACTION_THRESHOLD)
  )
  for (const transaction of revertedTransactions) {
    yield put(watchRevertedTransaction(transaction.hash))
  }
}
