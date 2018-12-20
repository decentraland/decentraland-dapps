import { takeLatest, put, select, ForkEffect } from 'redux-saga/effects'
import { push } from 'react-router-redux'

import {
  NavigateToAction,
  NAVIGATE_TO,
  navigateTo,
  NAVIGATE_TO_SIGN_IN,
  NAVIGATE_TO_ROOT,
  NavigateToSignInAction,
  NavigateToRootAction
} from './actions'
import { CONNECT_WALLET_SUCCESS } from '../wallet/actions'
import { isSignIn, getLocations } from './selectors'
import { Locations } from './types'

export function* locationSaga(): IterableIterator<ForkEffect> {
  yield takeLatest(NAVIGATE_TO, handleNavigateTo)
  yield takeLatest(NAVIGATE_TO_SIGN_IN, handleNavigateToSignIn)
  yield takeLatest(NAVIGATE_TO_ROOT, handleNavigateToRoot)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

function* handleNavigateTo(action: NavigateToAction) {
  // We're aware of https://github.com/reactjs/react-router-redux#how-do-i-access-router-state-in-a-container-component
  // But in this particular case, we're outside the lifecycle of React so it shouldn't be a problem
  const { pathname, search } = yield select(
    (state: any) => state.router.location
  )
  if (pathname + search !== action.payload.url) {
    yield put(push(action.payload.url))
  }
}

function* handleNavigateToSignIn(_: NavigateToSignInAction) {
  const locations: Locations = yield select(getLocations)
  yield put(navigateTo(locations.signIn))
}

function* handleNavigateToRoot(_: NavigateToRootAction) {
  const locations: Locations = yield select(getLocations)
  yield put(navigateTo(locations.root))
}

function* handleConnectWalletSuccess() {
  if (yield select(isSignIn)) {
    const locations: Locations = yield select(getLocations)
    yield put(navigateTo(locations.root))
  }
}
