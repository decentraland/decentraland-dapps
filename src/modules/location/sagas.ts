import { takeLatest, put, select, ForkEffect } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import { NavigateTo, NAVIGATE_TO } from './types'

export function* locationSaga(): IterableIterator<ForkEffect> {
  yield takeLatest(NAVIGATE_TO, handleNavigateTo)
}

function* handleNavigateTo(action: NavigateTo) {
  // We're aware of https://github.com/reactjs/react-router-redux#how-do-i-access-router-state-in-a-container-component
  // But in this particular case, we're outside the lifecycle of React so it shouldn't be a problem
  const { pathname, search } = yield select(
    (state: any) => state.router.location
  )
  if (pathname + search !== action.payload.url) {
    yield put(push(action.payload.url))
  }
}
