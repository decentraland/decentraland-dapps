import { LoadingState } from '../loading/reducer'
import { FeatureState } from './reducer'
import { Applications, Feature } from './types'

export const getState = (state: any): FeatureState => state.feature!
export const getData = (state: any): Record<Applications, Feature> =>
  getState(state).data
export const getLoading = (state: any): LoadingState => getState(state).loading
export const getError = (state: any): string | null => getState(state).error

export const getIsFeatureEnabled = (
  state: any,
  application: Applications,
  flag: string
): boolean => {
  const features = getData(state)
  const feature: Feature | undefined = features[application]

  if (!feature) {
    throw new Error(`Feature not found for application ${application}`)
  }

  const storeFlag: boolean | undefined = feature.flags[`${application}-${flag}`]

  if (storeFlag === undefined) {
    throw new Error(`Flag ${flag} not found for application ${application}`)
  }

  return storeFlag
}
