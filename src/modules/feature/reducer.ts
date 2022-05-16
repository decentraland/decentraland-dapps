import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  FetchFeaturesFailureAction,
  FetchFeaturesRequestAction,
  FetchFeaturesSuccessAction,
  FETCH_FEATURES_FAILURE,
  FETCH_FEATURES_REQUEST,
  FETCH_FEATURES_SUCCESS
} from './actions'
import { Feature } from './types'

export type FeatureState = {
  data: Record<string, Feature>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: FeatureState = {
  data: {},
  loading: [],
  error: null
}

export type FeatureReducerAction =
  | FetchFeaturesRequestAction
  | FetchFeaturesSuccessAction
  | FetchFeaturesFailureAction

export const featuresReducer = (
  state = INITIAL_STATE,
  action: FeatureReducerAction
): FeatureState => {
  switch (action.type) {
    case FETCH_FEATURES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_FEATURES_SUCCESS: {
      const { features } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: features
      }
    }
    case FETCH_FEATURES_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }
    default:
      return state
  }
}
