import { takeEvery, put, select } from 'redux-saga/effects'
import {
  getLocation,
  LOCATION_CHANGE,
  LocationChangeAction,
  replace
} from 'connected-react-router'
import { manaFiatGatewayPurchaseCompleted } from '../gateway/actions'
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
    const queryParams = new URLSearchParams(query)
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
