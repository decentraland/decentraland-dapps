import { LoadingState } from '../loading/reducer'
import { FeaturesState } from './reducer'
import {
  ApplicationName,
  ApplicationFeatures,
  StateWithFeatures
} from './types'

export const getState = (state: StateWithFeatures): FeaturesState =>
  state.features!

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
  const envValue = getFromEnv(app, feature)

  if (envValue !== null) {
    return envValue
  }

  const features = getData(state)
  const appFeatures: ApplicationFeatures | undefined = features[app]

  if (!appFeatures) {
    throw new Error(`Application "${app}" not found`)
  }

  return !!appFeatures.flags[`${app}-${feature}`]
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
