import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import {
  fetchApplicationFeaturesFailure,
  fetchApplicationFeaturesRequest,
  fetchApplicationFeaturesSuccess
} from './actions'
import { getMockApplicationFeaturesRecord } from './actions.spec'
import { featuresSaga } from './sagas'
import { ApplicationName, FeatureSagasConfig } from './types'
import { fetchApplicationFeatures } from './utils'

describe('when handling the request for fetching application features', () => {
  it('should put the success action', async () => {
    const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
    const features = getMockApplicationFeaturesRecord()

    await expectSaga(featuresSaga, {})
      .provide([[call(fetchApplicationFeatures, apps), features]])
      .dispatch(fetchApplicationFeaturesRequest(apps))
      .put(fetchApplicationFeaturesSuccess(apps, features))
      .silentRun()
  })

  describe('when the call to fetch application features fails', () => {
    it('should put the failure action', async () => {
      const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
      const error = 'error'

      await expectSaga(featuresSaga, {})
        .provide([
          [
            call(fetchApplicationFeatures, apps),
            Promise.reject(new Error(error))
          ]
        ])
        .dispatch(fetchApplicationFeaturesRequest(apps))
        .put(fetchApplicationFeaturesFailure(apps, error))
        .silentRun()
    })
  })
})

describe('when providing a polling object in the saga configuration', () => {
  const delay = 1000

  let apps: ApplicationName[]
  let config: FeatureSagasConfig

  beforeEach(() => {
    apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]

    config = {
      polling: {
        apps,
        delay
      }
    }
  })

  it('should put a fetch features request and a delay', async () => {
    const features = getMockApplicationFeaturesRecord()

    await expectSaga(featuresSaga, config)
      .provide([[call(fetchApplicationFeatures, apps), features]])
      .put(fetchApplicationFeaturesRequest(apps))
      .put(fetchApplicationFeaturesSuccess(apps, features))
      .delay(delay)
      .silentRun()
  })

  describe('when fetching the features fails', () => {
    it('should put a fetching failure action before the delay', async () => {
      const error = 'error'

      await expectSaga(featuresSaga, config)
        .provide([
          [
            call(fetchApplicationFeatures, apps),
            Promise.reject(new Error(error))
          ]
        ])
        .put(fetchApplicationFeaturesRequest(apps))
        .put(fetchApplicationFeaturesFailure(apps, error))
        .delay(delay)
        .silentRun()
    })
  })
})
