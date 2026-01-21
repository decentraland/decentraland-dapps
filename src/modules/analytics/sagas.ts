import { ForkEffect, takeLatest } from 'redux-saga/effects'
import { connection } from 'decentraland-connect'
import {
  CONNECT_WALLET_SUCCESS,
  ConnectWalletSuccessAction,
} from '../wallet/actions'
import { getAnalytics, trackConnectWallet } from './utils'

export function createAnalyticsSaga() {
  return function* analyticsSaga(): IterableIterator<ForkEffect> {
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  }
}

function handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
  const { wallet } = action.payload
  const analytics = getAnalytics()

  if (analytics) {
    // Identify the user that has just connected.
    analytics.identify({ ethAddress: wallet.address, chainId: wallet.chainId })

    // Track useful connection data.
    // Not using the add function from utils to track the action automatically because
    // the analytics middleware will call this before the identify.
    trackConnectWallet({
      address: wallet.address,
      chainId: wallet.chainId,
      providerType: wallet.providerType,
      walletName: connection.getWalletName(),
    })
  }
}
