import {
  takeEvery,
  put,
  call,
  delay,
  take,
  select,
  race
} from 'redux-saga/effects'
import { isErrorWithMessage } from '../../lib/error'
import { CONNECT_WALLET_SUCCESS, ConnectWalletSuccessAction } from '../wallet'
import {
  FetchCreditsRequestAction,
  fetchCreditsSuccess,
  fetchCreditsFailure,
  fetchCreditsRequest,
  PollCreditsBalanceRequestAction,
  POLL_CREDITS_BALANCE_REQUEST,
  FETCH_CREDITS_REQUEST,
  FETCH_CREDITS_SUCCESS,
  FETCH_CREDITS_FAILURE
} from './actions'
import { getCredits } from './selectors'
import { CreditsResponse } from './types'
import { CreditsClient } from './CreditsClient'
import { isCreditsFeatureEnabled } from '../features/selectors'

export function* creditsSaga(options: { creditsClient: CreditsClient }) {
  yield takeEvery(FETCH_CREDITS_REQUEST, handleFetchCreditsRequest)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeEvery(POLL_CREDITS_BALANCE_REQUEST, handlePollCreditsBalanceRequest)

  function* handleFetchCreditsRequest(action: FetchCreditsRequestAction) {
    const { address } = action.payload

    const isCreditsEnabled: boolean = yield select(
      isCreditsFeatureEnabled,
      address
    )

    if (!isCreditsEnabled) {
      return
    }

    try {
      const credits: CreditsResponse = yield call(
        [options.creditsClient, 'fetchCredits'],
        address
      )
      yield put(fetchCreditsSuccess(address, credits))
    } catch (error) {
      yield put(
        fetchCreditsFailure(
          address,
          isErrorWithMessage(error) ? error.message : 'Unknown error'
        )
      )
    }
  }

  function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
    const { address } = action.payload.wallet
    yield put(fetchCreditsRequest(address))
  }

  function* handlePollCreditsBalanceRequest(
    action: PollCreditsBalanceRequestAction
  ) {
    const { address, expectedBalance } = action.payload
    // max of 10 attempts
    const maxAttempts = 10
    let attempts = 0
    while (attempts < maxAttempts) {
      yield put(fetchCreditsRequest(address))
      const { success, failure } = yield race({
        success: take(FETCH_CREDITS_SUCCESS),
        failure: take(FETCH_CREDITS_FAILURE)
      })
      if (success) {
        const credits: CreditsResponse = yield select(getCredits, address)
        if (BigInt(credits.totalCredits) === expectedBalance) {
          yield put(fetchCreditsSuccess(address, credits))
          break
        }
      }
      if (failure) {
        yield put(fetchCreditsFailure(address, failure.payload.error))
        break
      }
      yield delay(2000)
      attempts++
    }
  }
}
