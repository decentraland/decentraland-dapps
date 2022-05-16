import { call, delay, put, spawn, takeEvery } from 'redux-saga/effects'
import {
  fetchFeaturesFailure,
  fetchFeaturesRequest,
  FetchFeaturesRequestAction,
  fetchFeaturesSuccess,
  FETCH_FEATURES_REQUEST
} from './actions'
import { Applications, Feature, FeatureSagasConfig } from './types'
import { fetchFeatures } from './utils'

/**
 * Adding this to your sagas will constantly query feature flags for provided applications.
 * Results will be stored in redux and the implementing app will be able to react to this changes
 * live without the need of refreshing the browser.
 * @param config Object with information useful to the saga.
 * @param config.applications Feature flags of all applications provided will be fetched.
 * @param config.fetchDelay Time in millis between each poll to the feature flag service.
 */
export function* featureSaga(config: FeatureSagasConfig) {
  yield takeEvery(FETCH_FEATURES_REQUEST, handleFetchFeaturesRequest)
  yield spawn(fetchFeaturesInterval)

  function* handleFetchFeaturesRequest(action: FetchFeaturesRequestAction) {
    const { applications } = action.payload

    try {
      const features: Record<Applications, Feature> = yield call(
        fetchFeatures,
        applications
      )

      yield put(fetchFeaturesSuccess(applications, features))
    } catch (e) {
      yield put(fetchFeaturesFailure(applications, e.message))
    }
  }

  function* fetchFeaturesInterval() {
    while (true) {
      const { applications, fetchDelay } = config
      yield put(fetchFeaturesRequest(applications))
      yield delay(fetchDelay)
    }
  }
}
