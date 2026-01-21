import { LoadingState, loadingReducer } from '../loading/reducer'
import { FETCH_TRANSACTION_SUCCESS, FetchTransactionSuccessAction } from '../transaction/actions'
import {
  AUTHORIZATION_FLOW_CLEAR,
  AUTHORIZATION_FLOW_FAILURE,
  AUTHORIZATION_FLOW_REQUEST,
  AUTHORIZATION_FLOW_SUCCESS,
  AuthorizationFlowClearAction,
  AuthorizationFlowFailureAction,
  AuthorizationFlowRequestAction,
  AuthorizationFlowSuccessAction,
  FETCH_AUTHORIZATIONS_FAILURE,
  FETCH_AUTHORIZATIONS_REQUEST,
  FETCH_AUTHORIZATIONS_SUCCESS,
  FetchAuthorizationsFailureAction,
  FetchAuthorizationsRequestAction,
  FetchAuthorizationsSuccessAction,
  GRANT_TOKEN_FAILURE,
  GRANT_TOKEN_REQUEST,
  GRANT_TOKEN_SUCCESS,
  GrantTokenFailureAction,
  GrantTokenRequestAction,
  GrantTokenSuccessAction,
  REVOKE_TOKEN_FAILURE,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  RevokeTokenFailureAction,
  RevokeTokenRequestAction,
  RevokeTokenSuccessAction
} from './actions'
import { Authorization } from './types'
import { areEqual } from './utils'

export type AuthorizationState = {
  data: Authorization[]
  loading: LoadingState
  error: string | null
  authorizationFlowError: string | null
}

export const INITIAL_STATE = {
  data: [],
  loading: [],
  error: null,
  authorizationFlowError: null
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
  | AuthorizationFlowRequestAction
  | AuthorizationFlowSuccessAction
  | AuthorizationFlowFailureAction
  | AuthorizationFlowClearAction

export function authorizationReducer(state: AuthorizationState = INITIAL_STATE, action: AuthorizationReducerAction) {
  switch (action.type) {
    case GRANT_TOKEN_REQUEST:
    case REVOKE_TOKEN_REQUEST:
    case GRANT_TOKEN_SUCCESS:
    case REVOKE_TOKEN_SUCCESS:
    case FETCH_AUTHORIZATIONS_REQUEST: {
      return {
        ...state,
        error: null,
        loading: loadingReducer(state.loading, action)
      }
    }
    case AUTHORIZATION_FLOW_REQUEST:
    case AUTHORIZATION_FLOW_SUCCESS:
      return {
        ...state,
        authorizationFlowError: null,
        loading: loadingReducer(state.loading, action)
      }
    case AUTHORIZATION_FLOW_FAILURE:
      return {
        ...state,
        authorizationFlowError: action.payload.error,
        loading: loadingReducer(state.loading, action)
      }
    case FETCH_AUTHORIZATIONS_SUCCESS: {
      const { authorizations } = action.payload

      // TODO: Optimize with some sort of Map structure to prevent O(n^2)
      // Filters out all authorizations in the state that have been obtained in the fetch to prevent duplication.
      const baseAuthorizations = state.data.filter(stateAuth => !authorizations.some(([original]) => areEqual(original, stateAuth)))

      // Get from the fetched authorizations the ones that are not null.
      const newAuthorizations = authorizations.reduce((acc, next) => {
        const [_, result] = next
        if (result) {
          acc.push(result)
        }
        return acc
      }, [] as Authorization[])

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        // concat the base and new authorizations, without duplications and removing the ones that are now null.
        data: [...baseAuthorizations, ...newAuthorizations]
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
    case AUTHORIZATION_FLOW_CLEAR: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        authorizationFlowError: null
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const transaction = action.payload.transaction

      switch (transaction.actionType) {
        case GRANT_TOKEN_SUCCESS: {
          const { authorization } = transaction.payload
          const data = state.data.filter(stateAuthorization => !areEqual(stateAuthorization, authorization))
          data.push(authorization)

          return {
            ...state,
            data
          }
        }
        case REVOKE_TOKEN_SUCCESS: {
          const { authorization } = transaction.payload

          return {
            ...state,
            data: [...state.data.filter(stateAuthorization => !areEqual(stateAuthorization, authorization))]
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
