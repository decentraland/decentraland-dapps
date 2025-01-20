import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { ContentfulResponse, MarketingAdminFields } from '@dcl/schemas'
import {
  mockAdminEntry,
  marketplaceHomepageBannerAssets,
  mockCampaignEntry,
  mockHomepageBannerEntry
} from '../../tests/contentfulMocks'
import { ContentfulClient } from './ContentfulClient'
import { campaignSagas } from './sagas'
import {
  fetchCampaignRequest,
  fetchCampaignSuccess,
  fetchCampaignFailure
} from './actions'

describe('when handling the fetch campaign request', () => {
  let mockConfig: {
    space: string
    environment: string
    id: string
    token: string
  }
  let mockClient: ContentfulClient
  let mockResponse: ContentfulResponse<MarketingAdminFields>

  beforeEach(() => {
    mockConfig = {
      space: 'space-id',
      environment: 'environment-id',
      id: 'entry-id',
      token: 'access-token'
    }
    mockClient = new ContentfulClient()
  })

  describe('when the request is successful', () => {
    beforeEach(() => {
      mockResponse = {
        items: [{ ...mockAdminEntry }],
        includes: {
          Asset: [...marketplaceHomepageBannerAssets],
          Entry: [{ ...mockHomepageBannerEntry }, { ...mockCampaignEntry }]
        }
      }
    })

    it('should put fetch campaign success with the transformed campaign data', () => {
      return expectSaga(campaignSagas, mockClient, mockConfig)
        .provide([
          [
            matchers.call(
              [mockClient, 'fetchEntry'],
              mockConfig.space,
              mockConfig.environment,
              mockConfig.id,
              'admin',
              mockConfig.token
            ),
            mockResponse
          ]
        ])
        .put(
          fetchCampaignSuccess(
            {
              marketplaceHomepageBanner: { ...mockHomepageBannerEntry.fields }
            },
            {
              [marketplaceHomepageBannerAssets[0].sys.id]:
                marketplaceHomepageBannerAssets[0],
              [marketplaceHomepageBannerAssets[1].sys.id]:
                marketplaceHomepageBannerAssets[1],
              [marketplaceHomepageBannerAssets[2].sys.id]:
                marketplaceHomepageBannerAssets[2]
            },
            mockCampaignEntry.fields.name,
            mockCampaignEntry.fields.marketplaceTabName,
            mockCampaignEntry.fields.mainTag?.['en-US'],
            mockCampaignEntry.fields.additionalTags?.['en-US']
          )
        )
        .dispatch(fetchCampaignRequest())
        .run()
    })
  })

  describe('when the request fails', () => {
    it('should put fetch campaign failure with the error message', () => {
      const error = new Error('Network error')

      return expectSaga(campaignSagas, mockClient, mockConfig)
        .provide([
          [
            matchers.call(
              [mockClient, 'fetchEntry'],
              mockConfig.space,
              mockConfig.environment,
              mockConfig.id,
              'admin',
              mockConfig.token
            ),
            throwError(error)
          ]
        ])
        .put(fetchCampaignFailure('Network error'))
        .dispatch(fetchCampaignRequest())
        .run()
    })
  })

  describe('when the response contains no items', () => {
    beforeEach(() => {
      mockResponse = {
        items: [],
        includes: {}
      }
    })

    it('should put fetch campaign failure with an error message', () => {
      return expectSaga(campaignSagas, mockClient, mockConfig)
        .provide([
          [
            matchers.call(
              [mockClient, 'fetchEntry'],
              mockConfig.space,
              mockConfig.environment,
              mockConfig.id,
              'admin',
              mockConfig.token
            ),
            mockResponse
          ]
        ])
        .put(fetchCampaignFailure('Failed to fetch campaign data'))
        .dispatch(fetchCampaignRequest())
        .run()
    })
  })
})
