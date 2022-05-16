import { action } from 'typesafe-actions'
import { Applications, Feature } from './types'

export const FETCH_FEATURES_REQUEST = '[Request] Fetch features'
export const FETCH_FEATURES_SUCCESS = '[Success] Fetch features'
export const FETCH_FEATURES_FAILURE = '[Failure] Fetch features'

export const fetchFeaturesRequest = (applications: Applications[]) =>
  action(FETCH_FEATURES_REQUEST, { applications })
export const fetchFeaturesSuccess = (
  applications: Applications[],
  features: Record<Applications, Feature>
) => action(FETCH_FEATURES_SUCCESS, { applications, features })
export const fetchFeaturesFailure = (
  applications: Applications[],
  error: string
) => action(FETCH_FEATURES_FAILURE, { applications, error })

export type FetchFeaturesRequestAction = ReturnType<typeof fetchFeaturesRequest>
export type FetchFeaturesSuccessAction = ReturnType<typeof fetchFeaturesSuccess>
export type FetchFeaturesFailureAction = ReturnType<typeof fetchFeaturesFailure>
