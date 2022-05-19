import { call, delay, put, spawn, takeEvery } from 'redux-saga/effects'
import {
  fetchApplicationFeaturesFailure,
  fetchApplicationFeaturesRequest,
  FetchApplicationFeaturesRequestAction,
  fetchApplicationFeaturesSuccess,
  FETCH_APPLICATION_FEATURES_REQUEST
} from './actions'
import {
  ApplicationName,
  ApplicationFeatures,
  FeatureSagasConfig,
  Polling
} from './types'
import { fetchApplicationFeatures } from './utils'

/**
 * Include this saga to be able to fetch feature flags for different applications.
 * By providing the polling object in the config, this saga will take care of polling every
 * certain amount of time the feature flags for the defined applications.
 * @param config Configuration for the saga
 */
export function* featuresSaga(config: FeatureSagasConfig) {
  const { polling } = config

  yield takeEvery(
    FETCH_APPLICATION_FEATURES_REQUEST,
    handleFetchApplicationFeaturesRequest
  )

  if (polling) {
    yield spawn(getFetchApplicationFeaturesIntervalGenerator(polling))
  }
}

function* handleFetchApplicationFeaturesRequest(
  action: FetchApplicationFeaturesRequestAction
) {
  const { apps } = action.payload

  try {
    const features: Record<ApplicationName, ApplicationFeatures> = yield call(
      fetchApplicationFeatures,
      apps
    )

    yield put(fetchApplicationFeaturesSuccess(apps, features))
  } catch (e) {
    yield put(fetchApplicationFeaturesFailure(apps, e.message))
  }
}

export const getFetchApplicationFeaturesIntervalGenerator = (
  polling: Polling
) => {
  return function*() {
    while (true) {
      yield put(fetchApplicationFeaturesRequest(polling.apps))
      yield delay(polling.delay)
    }
  }
}
