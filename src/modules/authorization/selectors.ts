import { getTransactionsByType } from '../transaction/selectors'
import { getAddress } from '../wallet/selectors'
import { GRANT_TOKEN_SUCCESS } from './actions'
import { AuthorizationType } from './types'

export const getState = (state: any) => state.authorization
export const getData = (state: any) => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const isLoading = (state: any) => getLoading(state).length > 0
export const getError = (state: any) => getState(state).error

export const getAllowTransactions = (state: any) =>
  getTransactionsByType(
    state,
    getAddress(state) || '',
    GRANT_TOKEN_SUCCESS
  ).filter(
    transaction =>
      transaction.payload.authorization.type === AuthorizationType.ALLOWANCE
  )

export const getApproveTransactions = (state: any) =>
  getTransactionsByType(
    state,
    getAddress(state) || '',
    GRANT_TOKEN_SUCCESS
  ).filter(
    transaction =>
      transaction.payload.authorization.type === AuthorizationType.APPROVAL
  )
