import { takeEvery, put, select } from 'redux-saga/effects'
import {
  getLocation,
  LOCATION_CHANGE,
  LocationChangeAction
} from 'connected-react-router'
import { manaFiatGatewayPurchaseCompleted } from '../manaFiatGateway/actions'
import { RedirectTransactionQuery } from './types'

export function* locationSaga() {
  yield takeEvery(LOCATION_CHANGE, handleLocationChange)
}

function* handleLocationChange(_action: LocationChangeAction) {
  const { query }: ReturnType<typeof getLocation> = yield select(getLocation)
  const {
    network,
    gateway,
    transactionId,
    transactionStatus
  } = query as RedirectTransactionQuery

  if (transactionId && transactionStatus && network && gateway) {
    yield put(
      manaFiatGatewayPurchaseCompleted(
        network,
        gateway,
        transactionId,
        transactionStatus
      )
    )
  }
}
