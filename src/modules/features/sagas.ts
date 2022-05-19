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
  FeatureSagasConfig
} from './types'
import { fetchManyApplicationFeatures } from './utils'

/**
 * Adding this to your sagas will constantly query feature flags for provided applications.
 * Results will be stored in redux and the implementing app will be able to react to this changes
 * live without the need of refreshing the browser.
 * @param config Object with information useful to the saga.
 * @param config.applications Feature flags of all applications provided will be fetched.
 * @param config.fetchDelay Time in millis between each poll to the feature flag service.
 */
export function* featuresSaga(config: FeatureSagasConfig) {
  yield takeEvery(
    FETCH_APPLICATION_FEATURES_REQUEST,
    handleFetchApplicationFeaturesRequest
  )

  yield spawn(fetchApplicationFeaturesInterval)

  function* handleFetchApplicationFeaturesRequest(
    action: FetchApplicationFeaturesRequestAction
  ) {
    const { apps } = action.payload

    try {
      const allApplicationFeatures: Record<
        ApplicationName,
        ApplicationFeatures
      > = yield call(fetchManyApplicationFeatures, apps)

      yield put(fetchApplicationFeaturesSuccess(apps, allApplicationFeatures))
    } catch (e) {
      yield put(fetchApplicationFeaturesFailure(apps, e.message))
    }
  }

  function* fetchApplicationFeaturesInterval() {
    while (true) {
      const { apps: applications, fetchDelay } = config
      yield put(fetchApplicationFeaturesRequest(applications))
      yield delay(fetchDelay)
    }
  }
}
