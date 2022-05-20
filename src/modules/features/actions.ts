import { action } from 'typesafe-actions'
import { ApplicationName, ApplicationFeatures } from './types'

// Fetch all application features

export const FETCH_APPLICATION_FEATURES_REQUEST =
  '[Request] Fetch application features'

export const FETCH_APPLICATION_FEATURES_SUCCESS =
  '[Success] Fetch application features'

export const FETCH_APPLICATION_FEATURES_FAILURE =
  '[Failure] Fetch application features'

export const fetchApplicationFeaturesRequest = (apps: ApplicationName[]) =>
  action(FETCH_APPLICATION_FEATURES_REQUEST, { apps })

export const fetchApplicationFeaturesSuccess = (
  apps: ApplicationName[],
  features: Record<ApplicationName, ApplicationFeatures>
) =>
  action(FETCH_APPLICATION_FEATURES_SUCCESS, {
    apps,
    features
  })

export const fetchApplicationFeaturesFailure = (
  apps: ApplicationName[],
  error: string
) => action(FETCH_APPLICATION_FEATURES_FAILURE, { apps, error })

export type FetchApplicationFeaturesRequestAction = ReturnType<
  typeof fetchApplicationFeaturesRequest
>
export type FetchApplicationFeaturesSuccessAction = ReturnType<
  typeof fetchApplicationFeaturesSuccess
>
export type FetchApplicationFeaturesFailureAction = ReturnType<
  typeof fetchApplicationFeaturesFailure
>
