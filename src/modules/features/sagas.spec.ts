import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import {
  fetchApplicationFeaturesFailure,
  fetchApplicationFeaturesRequest,
  fetchApplicationFeaturesSuccess
} from './actions'
import { getMockApplicationFeaturesRecord } from './actions.spec'
import { featuresSaga } from './sagas'
import { ApplicationName } from './types'
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
  it('should put a fetch features request and a delay', async () => {
    const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
    const delay = 1000
    const features = getMockApplicationFeaturesRecord()

    const config = {
      polling: {
        apps,
        delay
      }
    }

    await expectSaga(featuresSaga, config)
      .provide([[call(fetchApplicationFeatures, apps), features]])
      .put(fetchApplicationFeaturesRequest(apps))
      .delay(delay)
      .put(fetchApplicationFeaturesSuccess(apps, features))
      .silentRun()
  })
})
