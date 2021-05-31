import { put, select, takeEvery } from 'redux-saga/effects'
import {
  renderToast,
  ShowToastAction,
  SHOW_TOAST,
  HIDE_TOAST,
  HideToastAction
} from './actions'
import { getState } from './selectors'
import * as cache from './cache'

export function* toastSaga() {
  yield takeEvery(SHOW_TOAST, handleShowToast)
  yield takeEvery(HIDE_TOAST, handleHideToast)
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
