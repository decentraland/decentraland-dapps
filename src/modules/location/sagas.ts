import { takeEvery, put, select } from 'redux-saga/effects'
import {
  getLocation,
  LOCATION_CHANGE,
  LocationChangeAction,
  replace
} from 'connected-react-router'
import { manaFiatGatewayPurchaseCompleted } from '../manaFiatGateway/actions'
import { RedirectTransactionQuery } from './types'

export function* locationSaga() {
  yield takeEvery(LOCATION_CHANGE, handleLocationChange)
}

function* handleLocationChange(_action: LocationChangeAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  const {
    network,
    gateway,
    transactionId,
    transactionStatus
  } = location.query as RedirectTransactionQuery

  if (transactionId && transactionStatus && network && gateway) {
    const queryParams = new URLSearchParams(location.search)
    const params = ['transactionId', 'transactionStatus', 'network', 'gateway']

    params.forEach(param => queryParams.delete(param))

    yield put(replace(`${location.pathname}?${queryParams.toString()}`))

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
