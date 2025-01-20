import { loadingReducer } from '../loading/reducer'
import {
  fetchCampaignRequest,
  fetchCampaignSuccess,
  fetchCampaignFailure
} from './actions'
import { campaignReducer } from './reducer'
import { CampaignState } from './types'

let initialState: CampaignState

describe('Campaign reducer', () => {
  beforeEach(() => {
    initialState = {
      data: null,
      loading: [],
      error: null
    }
  })

  describe('when handling the fetch campaign request action', () => {
    let state: CampaignState
    let action: ReturnType<typeof fetchCampaignRequest>

    beforeEach(() => {
      action = fetchCampaignRequest()
      const stateWithError: CampaignState = {
        ...initialState,
        error: 'Some previous error'
      }
      state = campaignReducer(stateWithError, action)
    })

    it('should add the action to the loading state and clear the error', () => {
      expect(state).toEqual({
        data: null,
        loading: loadingReducer([], action),
        error: null
      })
    })
  })

  describe('when handling the fetch campaign success action', () => {
    let state: CampaignState
    let requestAction: ReturnType<typeof fetchCampaignRequest>
    let successAction: ReturnType<typeof fetchCampaignSuccess>
    let campaignData: CampaignState['data']

    beforeEach(() => {
      requestAction = fetchCampaignRequest()
      campaignData = {
        name: { 'en-US': 'Test Name' },
        tabName: { 'en-US': 'Test Tab' },
        mainTag: 'main-tag',
        additionalTags: ['tag1', 'tag2'],
        banners: {},
        assets: {}
      }

      successAction = fetchCampaignSuccess(
        campaignData.banners,
        campaignData.assets,
        campaignData.name,
        campaignData.tabName,
        campaignData.mainTag,
        campaignData.additionalTags
      )

      const loadingState = campaignReducer(initialState, requestAction)
      state = campaignReducer(loadingState, successAction)
    })

    it('should update the data and remove the loading state', () => {
      expect(state).toEqual({
        data: campaignData,
        loading: loadingReducer([requestAction], successAction),
        error: null
      })
    })
  })

  describe('when handling the fetch campaign failure action', () => {
    let state: CampaignState
    let requestAction: ReturnType<typeof fetchCampaignRequest>
    let failureAction: ReturnType<typeof fetchCampaignFailure>
    let errorMessage: string

    beforeEach(() => {
      requestAction = fetchCampaignRequest()
      errorMessage = 'Failed to fetch campaign'
      failureAction = fetchCampaignFailure(errorMessage)

      const loadingState = campaignReducer(initialState, requestAction)
      state = campaignReducer(loadingState, failureAction)
    })

    it('should set the error and remove the loading state', () => {
      expect(state).toEqual({
        data: null,
        loading: loadingReducer([requestAction], failureAction),
        error: errorMessage
      })
    })
  })

  describe('when handling an unknown action', () => {
    let state: CampaignState

    beforeEach(() => {
      const action = { type: 'UNKNOWN_ACTION' }
      state = campaignReducer(initialState, action as any)
    })

    it('should return the same state', () => {
      expect(state).toEqual(initialState)
    })
  })
})
