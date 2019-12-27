import { takeLatest, takeEvery, ForkEffect } from 'redux-saga/effects'
import { getAnalytics } from './utils'
import {
  CONNECT_WALLET_SUCCESS,
  ConnectWalletSuccessAction
} from '../wallet/actions'

export type AnalyticsSagaOptions = {
  LOCATION_CHANGE: string
}

export function createAnalyticsSaga(
  options: AnalyticsSagaOptions = {
    LOCATION_CHANGE: '@@router/LOCATION_CHANGE'
  }
) {
  const { LOCATION_CHANGE } = options
  return function* analyticsSaga(): IterableIterator<ForkEffect> {
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
    yield takeEvery(LOCATION_CHANGE, handleLocationChange)
  }
}

// Identify users
function handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
  const { wallet } = action.payload
  const analytics = getAnalytics()

  if (analytics) {
    analytics.identify({ ethAddress: wallet.address })
  }
}

// Track pages
function handleLocationChange() {
  const analytics = getAnalytics()

  if (analytics) {
    analytics.page()
  }
}
