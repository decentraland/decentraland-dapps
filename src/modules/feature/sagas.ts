import { call, delay, put, spawn, takeEvery } from 'redux-saga/effects'
import {
  fetchFeaturesFailure,
  fetchFeaturesRequest,
  FetchFeaturesRequestAction,
  fetchFeaturesSuccess,
  FETCH_FEATURES_REQUEST
} from './actions'
import { Applications, Feature, FeatureSagasConfig } from './types'
import { fetchFeatures, fetchFeaturesDelay } from './utils'

/**
 * Adding this to your sagas will constantly query feature flags for provided applications.
 * Results will be stored in redux and the implementing app will be able to react to this changes
 * live without the need of refreshing the browser.
 * @param config.applications - Feature flags of all applications provided will be fetched.
 */
export function* featureSagas(config: FeatureSagasConfig) {
  yield takeEvery(FETCH_FEATURES_REQUEST, handleFetchFeaturesRequest)
  yield spawn(fetchFeaturesInLoop)

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

  function* fetchFeaturesInLoop() {
    while (true) {
      const { applications } = config
      yield put(fetchFeaturesRequest(applications))
      yield delay(fetchFeaturesDelay)
    }
  }
}
