import { ChainId } from '@dcl/schemas'
import { LoadingState, loadingReducer } from '../loading/reducer'
import {
  FetchTransactionSuccessAction,
  FETCH_TRANSACTION_SUCCESS
} from '../transaction/actions'
import {
  FetchAuthorizationsRequestAction,
  FetchAuthorizationsSuccessAction,
  FetchAuthorizationsFailureAction,
  GrantTokenSuccessAction,
  RevokeTokenSuccessAction,
  FETCH_AUTHORIZATIONS_REQUEST,
  FETCH_AUTHORIZATIONS_SUCCESS,
  FETCH_AUTHORIZATIONS_FAILURE,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_SUCCESS
} from './actions'
import { Authorization } from './types'
import { areEqual } from './utils'

export type AuthorizationState = {
  data: Authorization[]
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE = {
  data: [],
  loading: [],
  error: null
}

type AuthorizationReducerAction =
  | FetchAuthorizationsRequestAction
  | FetchAuthorizationsSuccessAction
  | FetchAuthorizationsFailureAction
  | GrantTokenSuccessAction
  | RevokeTokenSuccessAction
  | FetchTransactionSuccessAction

export function authorizationReducer(
  state: AuthorizationState = INITIAL_STATE,
  action: AuthorizationReducerAction
) {
  switch (action.type) {
    case FETCH_AUTHORIZATIONS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_AUTHORIZATIONS_SUCCESS: {
      const { authorizations } = action.payload

      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: [...state.data, ...authorizations]
      }
    }
    case FETCH_AUTHORIZATIONS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const transaction = action.payload.transaction

      switch (transaction.actionType) {
        case GRANT_TOKEN_SUCCESS: {
          const { authorization } = transaction.payload

          return {
            ...state,
            data: [...state.data, { ...authorization }]
          }
        }
        case REVOKE_TOKEN_SUCCESS: {
          const { authorization } = transaction.payload

          return {
            ...state,
            data: [
              ...state.data.filter(stateAuthorization =>
                areEqual(stateAuthorization, authorization)
              )
            ]
          }
        }
        default:
          return state
      }
    }
    default:
      return state
  }
}
