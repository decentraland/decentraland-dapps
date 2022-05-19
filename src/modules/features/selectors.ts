import { LoadingState } from '../loading/reducer'
import { FeatureState } from './reducer'
import { ApplicationName, ApplicationFeatures, StateWithFeature } from './types'

export const getState = (state: StateWithFeature): FeatureState =>
  state.feature!

export const getData = (
  state: StateWithFeature
): Record<ApplicationName, ApplicationFeatures> => getState(state).data

export const getLoading = (state: StateWithFeature): LoadingState =>
  getState(state).loading

export const getError = (state: StateWithFeature): string | null =>
  getState(state).error

/**
 * Helper to get whether a feature flag is enabled or disabled.
 * It will first look into your env file for the feature flag, if it is not defined there,
 * it will look it in the requested and stored features data.
 * The env key will be determined from the application and the flag. For example, if the
 * application is "explorer" and the flag is "some-crazy-feature", it will look
 * for it as REACT_APP_FF_EXPLORER_SOME_CRAZY_FEATURE.
 *
 * @param state App store state.
 * @param application Application containing the flag.
 * @param flag Feature flag identifies.
 * @param fallback In case the flag does not exist in the state, this will be
 * the value returned instead of throwing an error.
 *
 * @returns Boolean saying if the flag is enabled or disabled.
 */
export const getIsFeatureEnabled = (
  state: StateWithFeature,
  application: ApplicationName,
  flag: string,
  fallback?: boolean
): boolean => {
  const envValue = getFromEnv(application, flag)

  if (envValue !== null) {
    return envValue
  }

  try {
    const allApplicationFeatures = getData(state)

    const applicationFeatures: ApplicationFeatures | undefined =
      allApplicationFeatures[application]

    if (!applicationFeatures) {
      throw new Error(`Feature not found for application ${application}`)
    }

    const ff: boolean | undefined =
      applicationFeatures.flags[`${application}-${flag}`]

    if (ff === undefined) {
      throw new Error(`Flag ${flag} not found for application ${application}`)
    }

    return ff
  } catch (e) {
    if (fallback !== undefined) {
      return fallback
    }

    throw e
  }
}

export const getFromEnv = (
  application: ApplicationName,
  flag: string
): boolean | null => {
  const envify = (word: string) => word.toUpperCase().replace('-', '_')
  const key = `REACT_APP_FF_${envify(application)}_${envify(flag)}`
  const value = process.env[key]

  return !value || value === '' ? null : value === '1' ? true : false
}