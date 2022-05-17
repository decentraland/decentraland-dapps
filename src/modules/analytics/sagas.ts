import { takeLatest, takeEvery, ForkEffect } from 'redux-saga/effects'
import { getAnalytics, trackConnectWallet } from './utils'
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

function handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
  const { wallet } = action.payload
  const analytics = getAnalytics()

  if (analytics) {
    // Identify the user that has just connected.
    analytics.identify({ ethAddress: wallet.address })

    // Track useful connection data.
    // Not using the add function from utils to track the action automatically because
    // the analytics middleware will call this before the identify.
    trackConnectWallet({
      address: wallet.address,
      providerType: wallet.providerType
    })
  }
}

// Track pages
function handleLocationChange() {
  const analytics = getAnalytics()

  if (analytics) {
    analytics.page()
  }
}
