import { action } from 'typesafe-actions'
import { CreditsResponse } from './types'

// Fetch credits
export const FETCH_CREDITS_REQUEST = '[Request] Fetch credits'
export const FETCH_CREDITS_SUCCESS = '[Success] Fetch credits'
export const FETCH_CREDITS_FAILURE = '[Failure] Fetch credits'

export const fetchCreditsRequest = (address: string) => action(FETCH_CREDITS_REQUEST, { address })
export const fetchCreditsSuccess = (address: string, credits: CreditsResponse) => action(FETCH_CREDITS_SUCCESS, { address, credits })
export const fetchCreditsFailure = (address: string, error: string) => action(FETCH_CREDITS_FAILURE, { address, error })

export type FetchCreditsRequestAction = ReturnType<typeof fetchCreditsRequest>
export type FetchCreditsSuccessAction = ReturnType<typeof fetchCreditsSuccess>
export type FetchCreditsFailureAction = ReturnType<typeof fetchCreditsFailure>

// Poll Credits Balance
export const POLL_CREDITS_BALANCE_REQUEST = '[Request] Poll credits balance'

export const pollCreditsBalanceRequest = (address: string, expectedBalance: bigint) =>
  action(POLL_CREDITS_BALANCE_REQUEST, { address, expectedBalance })

export type PollCreditsBalanceRequestAction = ReturnType<typeof pollCreditsBalanceRequest>

// Credits real-time updates via SSE
export const START_CREDITS_SSE = '[Request] Start credits SSE connection'
export const STOP_CREDITS_SSE = '[Request] Stop credits SSE connection'

export const startCreditsSSE = (address: string) => action(START_CREDITS_SSE, { address })

export const stopCreditsSSE = () => action(STOP_CREDITS_SSE)

export type StartCreditsSSEAction = ReturnType<typeof startCreditsSSE>
export type StopCreditsSSEAction = ReturnType<typeof stopCreditsSSE>

// For backward compatibility
export const START_CREDITS_AUTO_POLLING = START_CREDITS_SSE
export const STOP_CREDITS_AUTO_POLLING = STOP_CREDITS_SSE
export const startCreditsAutoPolling = startCreditsSSE
export const stopCreditsAutoPolling = stopCreditsSSE
export type StartCreditsAutoPollingAction = StartCreditsSSEAction
export type StopCreditsAutoPollingAction = StopCreditsSSEAction
