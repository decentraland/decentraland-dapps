import { LoadingState, loadingReducer } from '../loading/reducer'
import {
  FetchTransactionSuccessAction,
  FETCH_TRANSACTION_SUCCESS
} from '../transaction/actions'
import {
  FetchAuthorizationsRequestAction,
  FetchAuthorizationsSuccessAction,
  FetchAuthorizationsFailureAction,
  GrantTokenRequestAction,
  GrantTokenSuccessAction,
  GrantTokenFailureAction,
  RevokeTokenRequestAction,
  RevokeTokenSuccessAction,
  RevokeTokenFailureAction,
  FETCH_AUTHORIZATIONS_REQUEST,
  FETCH_AUTHORIZATIONS_SUCCESS,
  FETCH_AUTHORIZATIONS_FAILURE,
  GRANT_TOKEN_REQUEST,
  GRANT_TOKEN_SUCCESS,
  GRANT_TOKEN_FAILURE,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  REVOKE_TOKEN_FAILURE
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
  | GrantTokenRequestAction
  | GrantTokenSuccessAction
  | GrantTokenFailureAction
  | RevokeTokenRequestAction
  | RevokeTokenSuccessAction
  | RevokeTokenFailureAction
  | FetchTransactionSuccessAction

export function authorizationReducer(
  state: AuthorizationState = INITIAL_STATE,
  action: AuthorizationReducerAction
) {
  switch (action.type) {
    case GRANT_TOKEN_REQUEST:
    case REVOKE_TOKEN_REQUEST:
    case GRANT_TOKEN_SUCCESS:
    case REVOKE_TOKEN_SUCCESS:
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
    case GRANT_TOKEN_FAILURE:
    case REVOKE_TOKEN_FAILURE:
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
