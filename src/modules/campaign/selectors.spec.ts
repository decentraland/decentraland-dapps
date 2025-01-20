import { ContentfulLocale, ContentfulAsset, BannerFields } from '@dcl/schemas'
import { TranslationState } from '../translation/reducer'
import { fetchCampaignRequest } from './actions'
import {
  getState,
  getData,
  getLoading,
  getError,
  isLoading,
  getMainTag,
  getAllTags,
  getAssets,
  getTabName,
  getBanner,
  getBannerAssets,
  getCampaignName,
  getAdditionalTags,
  getContentfulNormalizedLocale
} from './selectors'
import { CampaignState } from './types'

type MockState = {
  campaign: CampaignState
  translation: TranslationState
}

let mockState: MockState
let mockAsset: ContentfulAsset
let mockBanner: BannerFields

describe('Campaign selectors', () => {
  beforeEach(() => {
    mockAsset = {
      metadata: {
        tags: [],
        concepts: []
      },
      sys: {
        id: 'asset1',
        type: 'Asset',
        space: { sys: { type: 'Link', linkType: 'Space', id: 'space1' } },
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
        environment: {
          sys: { type: 'Link', linkType: 'Environment', id: 'env1' }
        },
        publishedVersion: 1,
        revision: 1
      },
      fields: {
        title: {
          'en-US': 'Test Banner'
        },
        description: {
          'en-US': 'Test Description'
        },
        file: {
          'en-US': {
            url: 'test-url',
            details: {
              size: 123
            },
            fileName: 'test.png',
            contentType: 'image/png'
          }
        }
      }
    }

    mockBanner = {
      fullSizeBackground: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: 'asset1'
          }
        }
      }
    } as BannerFields

    mockState = {
      campaign: {
        data: {
          name: {
            'en-US': 'Test Campaign'
          },
          tabName: {
            'en-US': 'testTab'
          },
          mainTag: 'main',
          additionalTags: ['tag1', 'tag2'],
          banners: {
            banner1: mockBanner
          },
          assets: {
            asset1: mockAsset
          }
        },
        loading: [],
        error: null
      },
      translation: {
        data: {},
        locale: 'en',
        loading: [],
        error: null
      }
    }
  })

  describe('when getting the campaign state', () => {
    it('should return the campaign state', () => {
      expect(getState(mockState)).toEqual(mockState.campaign)
    })
  })

  describe('when getting the campaign data', () => {
    describe('and the data exists', () => {
      it('should return the campaign data', () => {
        expect(getData(mockState)).toEqual(mockState.campaign.data)
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return null', () => {
        expect(getData(mockState)).toBeNull()
      })
    })
  })

  describe('when getting the loading state', () => {
    it('should return the loading state', () => {
      expect(getLoading(mockState)).toEqual(mockState.campaign.loading)
    })
  })

  describe('when getting the error state', () => {
    describe('and there is no error', () => {
      it('should return null', () => {
        expect(getError(mockState)).toBeNull()
      })
    })

    describe('and there is an error', () => {
      beforeEach(() => {
        mockState.campaign.error = 'Test error'
      })

      it('should return the error message', () => {
        expect(getError(mockState)).toBe('Test error')
      })
    })
  })

  describe('when checking if the campaign is loading', () => {
    describe('and there is no fetch request in progress', () => {
      it('should return false', () => {
        expect(isLoading(mockState)).toBe(false)
      })
    })

    describe('and there is a fetch request in progress', () => {
      beforeEach(() => {
        mockState.campaign.loading = [fetchCampaignRequest()]
      })

      it('should return true', () => {
        expect(isLoading(mockState)).toBe(true)
      })
    })
  })

  describe('when getting the main tag', () => {
    describe('and the data exists', () => {
      it('should return the main tag', () => {
        expect(getMainTag(mockState)).toBe('main')
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return undefined', () => {
        expect(getMainTag(mockState)).toBeUndefined()
      })
    })
  })

  describe('when getting the campaign name', () => {
    describe('and the data exists', () => {
      it('should return the campaign name', () => {
        expect(getCampaignName(mockState)).toEqual({
          'en-US': 'Test Campaign'
        })
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return null', () => {
        expect(getCampaignName(mockState)).toBeNull()
      })
    })
  })

  describe('when getting additional tags', () => {
    describe('and the data exists', () => {
      it('should return the additional tags', () => {
        expect(getAdditionalTags(mockState)).toEqual(['tag1', 'tag2'])
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return an empty array', () => {
        expect(getAdditionalTags(mockState)).toEqual([])
      })
    })
  })

  describe('when getting the contentful normalized locale', () => {
    describe('and the locale is en', () => {
      beforeEach(() => {
        mockState.translation.locale = 'en'
      })

      it('should return en-US', () => {
        expect(getContentfulNormalizedLocale(mockState)).toBe(
          ContentfulLocale.enUS
        )
      })
    })

    describe('and the locale is es', () => {
      beforeEach(() => {
        mockState.translation.locale = 'es'
      })

      it('should return es', () => {
        expect(getContentfulNormalizedLocale(mockState)).toBe(
          ContentfulLocale.es
        )
      })
    })

    describe('and the locale is zh', () => {
      beforeEach(() => {
        mockState.translation.locale = 'zh'
      })

      it('should return zh', () => {
        expect(getContentfulNormalizedLocale(mockState)).toBe(
          ContentfulLocale.zh
        )
      })
    })

    describe('and the locale is not supported', () => {
      beforeEach(() => {
        mockState.translation.locale = 'fr'
      })

      it('should return en-US', () => {
        expect(getContentfulNormalizedLocale(mockState)).toBe(
          ContentfulLocale.enUS
        )
      })
    })
  })

  describe('when getting all tags', () => {
    describe('and the data exists', () => {
      it('should return all tags including main tag', () => {
        expect(getAllTags(mockState)).toEqual(['main', 'tag1', 'tag2'])
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return an empty array', () => {
        expect(getAllTags(mockState)).toEqual([])
      })
    })
  })

  describe('when getting assets', () => {
    describe('and the data exists', () => {
      it('should return the assets', () => {
        expect(getAssets(mockState)).toEqual(mockState.campaign.data?.assets)
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return null', () => {
        expect(getAssets(mockState)).toBeNull()
      })
    })
  })

  describe('when getting the tab name', () => {
    describe('and the data exists', () => {
      it('should return the tab name', () => {
        expect(getTabName(mockState)).toEqual({
          'en-US': 'testTab'
        })
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return null', () => {
        expect(getTabName(mockState)).toBeNull()
      })
    })
  })

  describe('when getting a banner', () => {
    describe('and the banner exists', () => {
      it('should return the banner', () => {
        expect(getBanner(mockState, 'banner1')).toEqual(mockBanner)
      })
    })

    describe('and the banner does not exist', () => {
      it('should return null', () => {
        expect(getBanner(mockState, 'nonexistent')).toBeNull()
      })
    })

    describe('and there is no data', () => {
      beforeEach(() => {
        mockState.campaign.data = null
      })

      it('should return null', () => {
        expect(getBanner(mockState, 'banner1')).toBeNull()
      })
    })
  })

  describe('when getting banner assets', () => {
    describe('and the banner exists with assets', () => {
      it('should return the assets associated with the banner', () => {
        expect(getBannerAssets(mockState, 'banner1')).toEqual({
          asset1: mockAsset
        })
      })
    })

    describe('and the banner does not exist', () => {
      it('should return an empty object', () => {
        expect(getBannerAssets(mockState, 'nonexistent')).toEqual({})
      })
    })

    describe('and there are no assets', () => {
      beforeEach(() => {
        mockState.campaign.data!.assets = {}
      })

      it('should return an empty object', () => {
        expect(getBannerAssets(mockState, 'banner1')).toEqual({})
      })
    })
  })
})
