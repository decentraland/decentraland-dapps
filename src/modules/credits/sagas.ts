import {
  takeEvery,
  put,
  call,
  delay,
  take,
  select,
  race,
  fork,
  cancel,
  cancelled
} from 'redux-saga/effects'
import { Task, eventChannel, EventChannel, END } from 'redux-saga'
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
  FETCH_CREDITS_FAILURE,
  START_CREDITS_SSE,
  STOP_CREDITS_SSE,
  StartCreditsSSEAction,
  startCreditsSSE
} from './actions'
import { getCredits } from './selectors'
import { CreditsResponse } from './types'
import { CreditsClient } from './CreditsClient'
import { isCreditsFeatureEnabled } from '../features/selectors'

export function* creditsSaga(options: { creditsClient: CreditsClient }) {
  yield takeEvery(FETCH_CREDITS_REQUEST, handleFetchCreditsRequest)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeEvery(POLL_CREDITS_BALANCE_REQUEST, handlePollCreditsBalanceRequest)
  yield takeEvery(START_CREDITS_SSE, handleStartSSEConnection)

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
    // yield put(fetchCreditsRequest(address))
    yield put(startCreditsSSE(address))
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

  function* handleStartSSEConnection(
    action: StartCreditsSSEAction
  ): Generator<any, void, any> {
    const { address } = action.payload
    // Cancel any existing SSE connection task
    if (sseConnectionTask) {
      yield cancel(sseConnectionTask)

      // If there's an existing connection, close it
      if (currentSSEConnection) {
        currentSSEConnection.close()
        currentSSEConnection = null
      }
    }

    // Start a new SSE connection task
    sseConnectionTask = yield fork(startSSEConnection, address)
  }

  let sseConnectionTask: Task | null = null
  let currentSSEConnection: EventSource | null = null

  function createCreditsEventChannel(address: string): EventChannel<any> {
    return eventChannel((emit: (input: any) => void) => {
      // Check if credits feature is enabled
      const isCreditsEnabled = select(isCreditsFeatureEnabled, address)

      if (!isCreditsEnabled) {
        emit(END)
        return () => {}
      }

      // Create SSE connection
      const eventSource = options.creditsClient.createSSEConnection(
        address,
        (creditsData: CreditsResponse) => {
          console.log('got creditsData', creditsData)
          emit(fetchCreditsSuccess(address, creditsData))
        },
        (error: Event) => {
          console.error('SSE connection error:', error)
          emit(fetchCreditsFailure(address, 'SSE connection error'))
          emit(END)
        }
      )

      // Store the connection for cleanup
      currentSSEConnection = eventSource

      // Return unsubscribe function
      return () => {
        if (eventSource) {
          eventSource.close()
          currentSSEConnection = null
        }
      }
    })
  }

  function* startSSEConnection(address: string): Generator<any, void, any> {
    // First do an initial fetch to get the current state
    yield put(fetchCreditsRequest(address))

    try {
      // Create an event channel for SSE events
      const channel = yield call(createCreditsEventChannel, address)

      try {
        while (true) {
          // Wait for messages from the SSE connection
          const action = yield take(channel)
          yield put(action)
        }
      } finally {
        if (yield cancelled()) {
          // Clean up the channel if the saga is cancelled
          channel.close()
        }
      }
    } catch (error) {
      console.error('Error with SSE connection:', error)
      if (currentSSEConnection) {
        currentSSEConnection.close()
        currentSSEConnection = null
      }
    }
  }

  // Handle stop SSE connection
  yield takeEvery(
    STOP_CREDITS_SSE,
    function* handleStopSSEConnection(): Generator<any, void, any> {
      if (sseConnectionTask) {
        yield cancel(sseConnectionTask)
        sseConnectionTask = null
      }

      if (currentSSEConnection) {
        currentSSEConnection.close()
        currentSSEConnection = null
      }
    }
  )
}
