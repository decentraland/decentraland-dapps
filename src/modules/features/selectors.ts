import { LoadingState } from '../loading/reducer'
import { isLoadingType } from '../loading/selectors'
import { FETCH_APPLICATION_FEATURES_REQUEST } from './actions'
import { FeaturesState } from './reducer'
import {
  ApplicationName,
  ApplicationFeatures,
  StateWithFeatures
} from './types'

export const getState = (state: StateWithFeatures): FeaturesState => {
  const { features } = state

  // If the features prop is undefined in the state, it is because the client has not implemented the features reducer.
  // If any feature inside this lib requires querying the features reducer, it should try-catch any query to the state and handle accordingly. (Ignore checking for feature flags, etc.)
  if (!features) {
    throw new Error("'features' reducer not implemented")
  }

  return features
}

export const getData = (
  state: StateWithFeatures
): Record<ApplicationName, ApplicationFeatures> => getState(state).data

export const getLoading = (state: StateWithFeatures): LoadingState =>
  getState(state).loading

export const getError = (state: StateWithFeatures): string | null =>
  getState(state).error

/**
 * Helper to get whether a feature flag is enabled or disabled.
 * It will first look into your env file for the feature flag, if it is not defined there,
 * it will look it in the requested and stored features data.
 * The env key will be determined from the application and the flag. For example, if the
 * application is "explorer" and the flag is "some-crazy-feature", it will look
 * for it as REACT_APP_FF_EXPLORER_SOME_CRAZY_FEATURE.
 *
 * @param state Redux state of the application.
 * @param app Appplication name.
 * @param feature Feature key without the application name prefix. For example for the "builder-feature".
 * You need to provide only "feature"
 *
 * @returns Whether the feature is enabled or not.
 */
export const getIsFeatureEnabled = (
  state: StateWithFeatures,
  app: ApplicationName,
  feature: string
): boolean => {
  const env = getFromEnv(app, feature)

  // Return the flag value if it has been defined in the env.
  // If flags are only defined in the env, there is no need to implement the features reducer.
  if (env !== null) {
    return env
  }

  const appFlags = getData(state)[app]

  // The app might not be defined in the store because the flags might not have been fetched yet.
  // We suggest using isLoadingFeatureFlags and hasLoadedInitialFlags to handle this first.
  if (!appFlags) {
    return false
  }

  return !!appFlags.flags[`${app}-${feature}`]
}

export const isLoadingFeatureFlags = (state: StateWithFeatures) => {
  return isLoadingType(getLoading(state), FETCH_APPLICATION_FEATURES_REQUEST)
}

export const hasLoadedInitialFlags = (state: StateWithFeatures) => {
  return getState(state).hasLoadedInitialFlags
}

const getFromEnv = (
  application: ApplicationName,
  flag: string
): boolean | null => {
  const envify = (word: string) => word.toUpperCase().replace(/-/g, '_')
  const key = `REACT_APP_FF_${envify(application)}_${envify(flag)}`
  const value = process.env[key]

  return !value || value === '' ? null : value === '1' ? true : false
}
