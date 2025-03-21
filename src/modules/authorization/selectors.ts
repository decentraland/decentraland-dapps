import { getTransactionsByType } from '../transaction/selectors'
import { getAddress } from '../wallet/selectors'
import { AUTHORIZATION_FLOW_REQUEST, GRANT_TOKEN_SUCCESS } from './actions'
import { AuthorizationState } from './reducer'
import { Authorization, AuthorizationType } from './types'

export const getState: (state: any) => AuthorizationState = state =>
  state.authorization
export const getData = (state: any): Authorization[] => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const isLoading = (state: any): boolean => getLoading(state).length > 0
export const getError = (state: any): string | null => getState(state).error
export const getAuthorizationFlowError = (state: any): string | null =>
  getState(state).authorizationFlowError

export const getTransactions = (state: any) =>
  getTransactionsByType(state, getAddress(state) || '', GRANT_TOKEN_SUCCESS)

export const getAllowTransactions = (state: any) =>
  getTransactions(state).filter(
    transaction =>
      transaction.payload.authorization.type === AuthorizationType.ALLOWANCE
  )

export const getApproveTransactions = (state: any) =>
  getTransactions(state).filter(
    transaction =>
      transaction.payload.authorization.type === AuthorizationType.APPROVAL
  )

export const isAuthorizing = (state: any): boolean =>
  getLoading(state).some(loading => loading.type === AUTHORIZATION_FLOW_REQUEST)
