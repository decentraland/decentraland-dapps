import { action } from 'typesafe-actions'
import { ENS, ENSError } from './types'

// Get a ENS List (list of names) owned by the current account
export const FETCH_ENS_LIST_REQUEST = '[Request] Fetch ENS List'
export const FETCH_ENS_LIST_SUCCESS = '[Success] Fetch ENS List'
export const FETCH_ENS_LIST_FAILURE = '[Failure] Fetch ENS List'

export const fetchENSListRequest = () => action(FETCH_ENS_LIST_REQUEST, {})
export const fetchENSListSuccess = (ensList: ENS[]) =>
  action(FETCH_ENS_LIST_SUCCESS, { ensList })
export const fetchENSListFailure = (error: ENSError) =>
  action(FETCH_ENS_LIST_FAILURE, { error })

export type FetchENSListRequestAction = ReturnType<typeof fetchENSListRequest>
export type FetchENSListSuccessAction = ReturnType<typeof fetchENSListSuccess>
export type FetchENSListFailureAction = ReturnType<typeof fetchENSListFailure>

// Set Alias
export const SET_ALIAS_REQUEST = '[Request] Set Alias'
export const SET_ALIAS_SUCCESS = '[Success] Set Alias'
export const SET_ALIAS_FAILURE = '[Failure] Set Alias'

export const setAliasRequest = (address: string, name: string) =>
  action(SET_ALIAS_REQUEST, { address, name })
export const setAliasSuccess = (address: string, name: string) =>
  action(SET_ALIAS_SUCCESS, { address, name })
export const setAliasFailure = (address: string, error: ENSError) =>
  action(SET_ALIAS_FAILURE, { address, error })

export type SetAliasRequestAction = ReturnType<typeof setAliasRequest>
export type SetAliasSuccessAction = ReturnType<typeof setAliasSuccess>
export type SetAliasFailureAction = ReturnType<typeof setAliasFailure>
