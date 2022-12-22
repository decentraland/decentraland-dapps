import {
  fetchApplicationFeaturesFailure,
  fetchApplicationFeaturesRequest,
  fetchApplicationFeaturesSuccess
} from './actions'
import { getMockApplicationFeaturesRecord } from './actions.spec'
import { featuresReducer } from './reducer'
import { ApplicationName } from './types'

describe('when handling the fetch features request', () => {
  it('should set error to null and add the action to the loading state', () => {
    const action = fetchApplicationFeaturesRequest([
      ApplicationName.ACCOUNT,
      ApplicationName.BUILDER
    ])

    const state = featuresReducer(
      { data: {}, hasLoadedInitialFlags: false, loading: [], error: 'error' },
      action
    )

    expect(state).toEqual({ data: {}, loading: [action], error: null })
  })
})

describe('when handling the fetch features success', () => {
  it("should update data, remove the request action from the loading state and set the flag to signal that the ff's were loaded", () => {
    const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
    const requestAction = fetchApplicationFeaturesRequest(apps)
    const features = getMockApplicationFeaturesRecord()
    const successAction = fetchApplicationFeaturesSuccess(apps, features)

    const state = featuresReducer(
      {
        data: {},
        hasLoadedInitialFlags: true,
        loading: [requestAction],
        error: null
      },
      successAction
    )

    expect(state).toEqual({ data: features, loading: [], error: null })
  })
})

describe('when handling the fetch features failure', () => {
  it('should update the error and remove the request action from the loading state', () => {
    const apps = [ApplicationName.ACCOUNT, ApplicationName.BUILDER]
    const requestAction = fetchApplicationFeaturesRequest(apps)
    const error = 'error'
    const failureAction = fetchApplicationFeaturesFailure(apps, error)

    const state = featuresReducer(
      {
        data: {},
        hasLoadedInitialFlags: false,
        loading: [requestAction],
        error: null
      },
      failureAction
    )

    expect(state).toEqual({ data: {}, loading: [], error })
  })
})
