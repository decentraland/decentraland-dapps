import { LoadingState, loadingReducer } from '../loading/reducer'
import {
  FetchENSListRequestAction,
  FetchENSListSuccessAction,
  FetchENSListFailureAction,
  FETCH_ENS_LIST_REQUEST,
  FETCH_ENS_LIST_SUCCESS,
  FETCH_ENS_LIST_FAILURE,
  SET_ALIAS_SUCCESS,
  SET_ALIAS_FAILURE,
  SET_ALIAS_REQUEST,
  SetAliasSuccessAction,
  SetAliasFailureAction,
  SetAliasRequestAction
} from './actions'
import { ENS, ENSError, Authorization } from './types'

export type ENSState = {
  data: Record<string, ENS>
  authorizations: Record<string, Authorization>
  loading: LoadingState
  error: ENSError | null
}

const INITIAL_STATE: ENSState = {
  data: {},
  authorizations: {},
  loading: [],
  error: null
}

export type ENSReducerAction =
  | FetchENSListRequestAction
  | FetchENSListSuccessAction
  | FetchENSListFailureAction
  | SetAliasSuccessAction
  | SetAliasFailureAction
  | SetAliasRequestAction

export function ensReducer(
  state: ENSState = INITIAL_STATE,
  action: ENSReducerAction
): ENSState {
  switch (action.type) {
    case SET_ALIAS_REQUEST:
    case SET_ALIAS_SUCCESS:
    case FETCH_ENS_LIST_REQUEST: {
      return {
        ...state,
        error: null,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_ENS_LIST_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          ...action.payload.ensList.reduce(
            (obj, ens) => {
              obj[ens.subdomain] = { ...obj[ens.subdomain], ...ens }
              return obj
            },
            { ...state.data }
          )
        }
      }
    }
    case SET_ALIAS_FAILURE:
    case FETCH_ENS_LIST_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: { ...action.payload.error }
      }
    }
    default:
      return state
  }
}
