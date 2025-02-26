import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import {
  ContentfulResponse,
  MarketingAdminFields,
  ContentfulEntry,
  LocalizedField,
  ContentfulAsset,
  BannerFields
} from '@dcl/schemas'
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
  const BANNER_CONTENT_TYPE = 'banner'
  const MARKETING_CAMPAIGN_CONTENT_TYPE = 'marketingCampaign'
  let mockConfig: {
    space: string
    environment: string
    id: string
  }
  let mockClient: ContentfulClient
  let mockResponse: {
    banners: Record<string, BannerFields & { id: string }>
    assets: Record<string, ContentfulAsset>
    name?: LocalizedField<string>
    tabName?: LocalizedField<string>
    mainTag?: string
    additionalTags?: string[]
  }

  beforeEach(() => {
    mockConfig = {
      space: 'space-id',
      environment: 'environment-id',
      id: '7FJAHnPOiCEHMJhrZ3sRmG'
    }
    mockClient = new ContentfulClient()
    mockResponse = {
      banners: {
        marketplaceHomepageBanner: {
          ...mockHomepageBannerEntry.fields,
          id: mockHomepageBannerEntry.sys.id
        },
        marketplaceCollectiblesBanner: {
          ...mockHomepageBannerEntry.fields,
          id: mockHomepageBannerEntry.sys.id
        },
        marketplaceCampaignCollectiblesBanner: {
          ...mockHomepageBannerEntry.fields,
          id: mockHomepageBannerEntry.sys.id
        },
        builderCampaignBanner: {
          ...mockHomepageBannerEntry.fields,
          id: mockHomepageBannerEntry.sys.id
        }
      },
      assets: marketplaceHomepageBannerAssets.reduce((acc, asset) => {
        acc[asset.sys.id] = asset
        return acc
      }, {} as Record<string, ContentfulAsset>),
      name: mockCampaignEntry.fields.name,
      tabName: mockCampaignEntry.fields.marketplaceTabName,
      mainTag: mockCampaignEntry.fields.mainTag?.['en-US'],
      additionalTags: mockCampaignEntry.fields.additionalTags?.['en-US']
    }
  })

  describe('when the request is successful', () => {
    it('should put fetch campaign success with the transformed campaign data', () => {
      return expectSaga(campaignSagas, mockClient, mockConfig)
        .provide([
          [
            matchers.call(
              [mockClient, 'fetchEntryAllLocales'],
              mockConfig.space,
              mockConfig.environment,
              mockConfig.id
            ),
            Promise.resolve(mockAdminEntry)
          ],
          [
            matchers.call(
              [mockClient, 'fetchEntriesFromEntryFields'],
              mockConfig.space,
              mockConfig.environment,
              mockAdminEntry.fields
            ),
            Promise.resolve([mockCampaignEntry, mockHomepageBannerEntry])
          ],
          [
            matchers.call(
              [mockClient, 'fetchAssetsFromEntryFields'],
              mockConfig.space,
              mockConfig.environment,
              [
                mockAdminEntry.fields,
                mockCampaignEntry.fields,
                mockHomepageBannerEntry.fields
              ]
            ),
            Promise.resolve(
              Object.fromEntries(
                marketplaceHomepageBannerAssets.map(asset => [
                  asset.sys.id,
                  asset
                ])
              )
            )
          ]
        ])
        .put(
          fetchCampaignSuccess(
            mockResponse.banners,
            mockResponse.assets,
            mockResponse.name,
            mockResponse.tabName,
            mockResponse.mainTag,
            mockResponse.additionalTags
          )
        )
        .dispatch(fetchCampaignRequest())
        .run(1000)
    })
  })

  describe('when the request fails', () => {
    it('should put fetch campaign failure with the error message', () => {
      const error = new Error('Network error')

      return expectSaga(campaignSagas, mockClient, mockConfig)
        .provide([
          [
            matchers.call(
              [mockClient, 'fetchEntryAllLocales'],
              mockConfig.space,
              mockConfig.environment,
              mockConfig.id
            ),
            throwError(error)
          ]
        ])
        .put(fetchCampaignFailure('Network error'))
        .dispatch(fetchCampaignRequest())
        .run(1000)
    })
  })

  describe('when the response contains no items', () => {
    it('should put fetch campaign failure with an error message', () => {
      jest
        .spyOn(ContentfulClient.prototype, 'fetchEntryAllLocales')
        .mockRejectedValue(new Error('Failed to fetch campaign data'))

      return expectSaga(campaignSagas, mockClient, mockConfig)
        .put(fetchCampaignFailure('Failed to fetch campaign data'))
        .dispatch(fetchCampaignRequest())
        .run(1000)
    })
  })
})
