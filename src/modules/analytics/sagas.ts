import { takeLatest, takeEvery, ForkEffect } from 'redux-saga/effects'
import { LOCATION_CHANGE } from 'react-router-redux'
import { CONNECT_WALLET_SUCCESS, ConnectWalletSuccess } from '../wallet/types'
import { getAnalytics } from './utils'

export function* analyticsSaga(): IterableIterator<ForkEffect> {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeEvery(LOCATION_CHANGE, handleLocationChange)
}

// Identify users
function handleConnectWalletSuccess(action: ConnectWalletSuccess) {
  const { wallet } = action.payload
  const analytics = getAnalytics()

  if (analytics) {
    analytics.identify(wallet.address)
  }
}

// Track pages
function handleLocationChange() {
  const analytics = getAnalytics()

  if (analytics) {
    analytics.page()
  }
}
