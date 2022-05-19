import { loadingReducer, LoadingState } from '../loading/reducer'
import {
  FetchApplicationFeaturesFailureAction,
  FetchApplicationFeaturesRequestAction,
  FetchApplicationFeaturesSuccessAction,
  FETCH_APPLICATION_FEATURES_FAILURE,
  FETCH_APPLICATION_FEATURES_REQUEST,
  FETCH_APPLICATION_FEATURES_SUCCESS
} from './actions'
import { ApplicationFeatures } from './types'

export type FeatureState = {
  data: Record<string, ApplicationFeatures>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: FeatureState = {
  data: {},
  loading: [],
  error: null
}

export type FeatureReducerAction =
  | FetchApplicationFeaturesRequestAction
  | FetchApplicationFeaturesSuccessAction
  | FetchApplicationFeaturesFailureAction

export const featuresReducer = (
  state = INITIAL_STATE,
  action: FeatureReducerAction
): FeatureState => {
  switch (action.type) {
    case FETCH_APPLICATION_FEATURES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_APPLICATION_FEATURES_SUCCESS: {
      const { features } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: features
      }
    }
    case FETCH_APPLICATION_FEATURES_FAILURE: {
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
