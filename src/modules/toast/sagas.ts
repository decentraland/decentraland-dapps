import { EventChannel, eventChannel } from 'redux-saga'
import { call, fork, put, select, take, takeEvery } from 'redux-saga/effects'
import { ErrorCode, MetaTransactionError } from 'decentraland-transactions'
import {
  renderToast,
  ShowToastAction,
  SHOW_TOAST,
  HIDE_TOAST,
  HideToastAction,
  showToast,
  hideAllToasts
} from './actions'
import { getState } from './selectors'
import * as cache from './cache'
import {
  TransactionEventData,
  TransactionEventType,
  transactionEvents
} from '../wallet/utils'
import { SWITCH_NETWORK_SUCCESS } from '../wallet/actions'
import {
  getContractAccountErrorToast,
  getInvalidAddressErrorToast,
  getUnknownErrorToast
} from './toasts/meta-transactions'

export function* toastSaga() {
  yield fork(watchMetaTransactionErrors)
  yield takeEvery(SHOW_TOAST, handleShowToast)
  yield takeEvery(HIDE_TOAST, handleHideToast)
  yield takeEvery(SWITCH_NETWORK_SUCCESS, handleSwitchNetworkSuccess)
}

function* handleShowToast(action: ShowToastAction) {
  const { toast } = action.payload

  const ids: number[] = yield select(getState)
  const lastId = Number(ids[ids.length - 1] || 0)
  const id = lastId + 1

  cache.set(id, toast)

  yield put(renderToast(id))
}

function* handleHideToast(action: HideToastAction) {
  const { id } = action.payload
  cache.remove(id)
}

export function createMetaTransactionsErrorChannel() {
  return eventChannel<ErrorCode>(emitter => {
    function handleError(
      data: TransactionEventData<TransactionEventType.ERROR>
    ) {
      if (data.error instanceof MetaTransactionError) {
        emitter(data.error.code)
      }
    }
    transactionEvents.on(TransactionEventType.ERROR, handleError)
    return () =>
      transactionEvents.removeListener(TransactionEventType.ERROR, handleError)
  })
}

export function* watchMetaTransactionErrors() {
  const channel: EventChannel<ErrorCode> = yield call(
    createMetaTransactionsErrorChannel
  )
  while (true) {
    const code: ErrorCode = yield take(channel)
    yield call(handleMetaTransactionError, code)
  }
}

export function* handleMetaTransactionError(code: ErrorCode) {
  switch (code) {
    case ErrorCode.CONTRACT_ACCOUNT: {
      yield put(showToast(getContractAccountErrorToast()))
      break
    }
    case ErrorCode.INVALID_ADDRESS: {
      yield put(showToast(getInvalidAddressErrorToast()))
      break
    }
    case ErrorCode.USER_DENIED: {
      // do nothing
      break
    }
    case ErrorCode.UNKNOWN:
    default: {
      yield put(showToast(getUnknownErrorToast()))
      break
    }
  }
}

function* handleSwitchNetworkSuccess() {
  yield put(hideAllToasts())
}
