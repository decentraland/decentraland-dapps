import {
  fetchApplicationFeaturesFailure,
  fetchApplicationFeaturesRequest,
  fetchApplicationFeaturesSuccess,
  FETCH_APPLICATION_FEATURES_FAILURE,
  FETCH_APPLICATION_FEATURES_REQUEST,
  FETCH_APPLICATION_FEATURES_SUCCESS
} from './actions'
import { ApplicationFeatures, ApplicationName } from './types'

export const getMockApplicationFeaturesRecord = () =>
  ({
    [ApplicationName.ACCOUNT]: {
      name: ApplicationName.ACCOUNT,
      flags: {
        [`${ApplicationName.ACCOUNT}-flag1`]: true,
        [`${ApplicationName.ACCOUNT}-flag2`]: false
      },
      variants: {
        [`${ApplicationName.ACCOUNT}-flag1`]: {
          enabled: true,
          name: 'name',
          payload: {
            type: 'type',
            value: 'value'
          }
        },
        [`${ApplicationName.ACCOUNT}-flag2`]: {
          enabled: false,
          name: 'name',
          payload: {
            type: 'type',
            value: 'value'
          }
        }
      }
    } as ApplicationFeatures,
    [ApplicationName.BUILDER]: {
      name: ApplicationName.BUILDER,
      flags: {
        [`${ApplicationName.BUILDER}-flag1`]: true,
        [`${ApplicationName.BUILDER}-flag2`]: false
      },
      variants: {
        [`${ApplicationName.BUILDER}-flag1`]: {
          enabled: true,
          name: 'name',
          payload: {
            type: 'type',
            value: 'value'
          }
        },
        [`${ApplicationName.BUILDER}-flag2`]: {
          enabled: false,
          name: 'name',
          payload: {
            type: 'type',
            value: 'value'
          }
        }
      }
    } as ApplicationFeatures
  } as Record<ApplicationName, ApplicationFeatures>)

describe('when fetching application features', () => {
  describe('when calling the request action creator', () => {
    it('should return the request action', () => {
      const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
      const action = fetchApplicationFeaturesRequest(apps)
      const payload = {
        meta: undefined,
        payload: { apps },
        type: FETCH_APPLICATION_FEATURES_REQUEST
      }

      expect(action).toEqual(payload)
    })
  })

  describe('when calling the success action creator', () => {
    it('should return the success action', () => {
      const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]

      const features = getMockApplicationFeaturesRecord()

      const action = fetchApplicationFeaturesSuccess(apps, features)

      const payload = {
        meta: undefined,
        payload: { apps, features },
        type: FETCH_APPLICATION_FEATURES_SUCCESS
      }

      expect(action).toEqual(payload)
    })
  })

  describe('when calling the failure action creator', () => {
    it('should return the failure action', () => {
      const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
      const error = 'error'
      const action = fetchApplicationFeaturesFailure(apps, error)

      const payload = {
        meta: undefined,
        payload: { apps, error },
        type: FETCH_APPLICATION_FEATURES_FAILURE
      }

      expect(action).toEqual(payload)
    })
  })
})
