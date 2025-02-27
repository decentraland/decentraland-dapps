import nock from 'nock'
import { ContentfulClient } from './ContentfulClient'
import {
  mockAdminEntry,
  marketplaceHomepageBannerAssets,
  mockHomepageBannerEntry
} from '../../tests/contentfulMocks'
import { ContentfulLocale } from '@dcl/schemas'

const CMS_URL = 'https://cms.decentraland.org'

describe('ContentfulClient', () => {
  let client: ContentfulClient
  let mockSpace: string
  let mockEnvironment: string
  let mockId: string
  let mockFields: Record<string, any>
  let mockResponses: {
    enUS: any
    es: any
    zh: any
  }

  beforeEach(() => {
    client = new ContentfulClient()
    mockSpace = 'test-space'
    mockEnvironment = 'test-env'
    mockId = 'test-id'
    mockFields = {
      image: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: marketplaceHomepageBannerAssets[0].sys.id
          }
        }
      }
    }
    mockResponses = {
      enUS: {
        fields: { title: { [ContentfulLocale.enUS]: 'English Title' } }
      },
      es: {
        fields: { title: { [ContentfulLocale.es]: 'Título en Español' } }
      },
      zh: {
        fields: { title: { [ContentfulLocale.zh]: '中文标题' } }
      }
    }

    nock(CMS_URL)
      .get(
        `/spaces/${mockSpace}/environments/${mockEnvironment}/assets/${mockId}/`
      )
      .reply(200, marketplaceHomepageBannerAssets[0])

    nock.cleanAll()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('fetchEntry', () => {
    describe('and the request is successful', () => {
      beforeEach(() => {
        nock(CMS_URL)
          .get('/spaces/space-id/environments/env-id/entries/entry-id/')
          .query({ locale: 'en-US' })
          .reply(200, mockAdminEntry)
      })

      it('should return the entry data', async () => {
        const result = await client.fetchEntry('space-id', 'env-id', 'entry-id')
        expect(result).toEqual(mockAdminEntry)
      })
    })

    describe('and the request fails', () => {
      beforeEach(() => {
        nock(CMS_URL)
          .get('/spaces/space-id/environments/env-id/entries/entry-id/')
          .query({ locale: 'en-US' })
          .reply(500)
      })

      it('should throw an error', async () => {
        await expect(
          client.fetchEntry('space-id', 'env-id', 'entry-id')
        ).rejects.toThrow('Failed to fetch entity data')
      })
    })
  })

  describe('fetchEntryAllLocales', () => {
    describe('when the request is successful', () => {
      beforeEach(() => {
        nock(CMS_URL)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}/`
          )
          .query({ locale: ContentfulLocale.enUS })
          .reply(200, mockResponses.enUS)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}/`
          )
          .query({ locale: ContentfulLocale.es })
          .reply(200, mockResponses.es)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}/`
          )
          .query({ locale: ContentfulLocale.zh })
          .reply(200, mockResponses.zh)
      })

      it('should combine fields from all available locales', async () => {
        const result = await client.fetchEntryAllLocales(
          mockSpace,
          mockEnvironment,
          mockId
        )

        expect(result).toEqual({
          title: {
            [ContentfulLocale.enUS]: 'English Title',
            [ContentfulLocale.es]: 'Título en Español',
            [ContentfulLocale.zh]: '中文标题'
          }
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        nock(CMS_URL)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}/`
          )
          .query({ locale: ContentfulLocale.enUS })
          .reply(500)
      })

      it('should throw an error', async () => {
        await expect(
          client.fetchEntryAllLocales(mockSpace, mockEnvironment, mockId)
        ).rejects.toThrow('Error fetching entry in all locales')
      })
    })
  })

  describe('fetchAsset', () => {
    describe('when the request is successful', () => {
      beforeEach(() => {
        nock(CMS_URL)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/assets/${mockId}/`
          )
          .reply(200, marketplaceHomepageBannerAssets[0])
      })

      it('should fetch and transform an asset to the correct format', async () => {
        const result = await client.fetchAsset(
          mockSpace,
          mockEnvironment,
          mockId
        )

        expect(result.fields).toHaveProperty('title.en-US')
        expect(result.fields).toHaveProperty('description.en-US')
        expect(result.fields).toHaveProperty('file.en-US')
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        nock(CMS_URL)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/assets/${mockId}/`
          )
          .replyWithError('Failed to fetch asset data')
      })

      it('should throw an error', async () => {
        await expect(
          client.fetchAsset(mockSpace, mockEnvironment, mockId)
        ).rejects.toThrow('Failed to fetch asset data')
      })
    })
  })

  describe('fetchAssetsFromEntryFields', () => {
    describe('when there are fields to get the assets from', () => {
      it('should get all assets referenced in the entry fields', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(marketplaceHomepageBannerAssets[0])
        })

        const result = await client.fetchAssetsFromEntryFields(
          mockSpace,
          mockEnvironment,
          [mockFields]
        )

        expect(result).toHaveProperty(marketplaceHomepageBannerAssets[0].sys.id)
        expect(Object.keys(result)).toHaveLength(1)
      })
    })

    describe('when there are no entry fields to look assets from', () => {
      it('should return empty object', async () => {
        const result = await client.fetchAssetsFromEntryFields(
          mockSpace,
          mockEnvironment,
          []
        )
        expect(result).toEqual({})
      })
    })
  })

  describe('fetchEntriesFromEntryFields', () => {
    it('should fetch all entries referenced in the entry fields', async () => {
      nock(CMS_URL)
        .get(
          `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockHomepageBannerEntry.sys.id}/`
        )
        .query({ locale: ContentfulLocale.enUS })
        .reply(200, mockHomepageBannerEntry)
        .get(
          `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockHomepageBannerEntry.sys.id}/`
        )
        .query({ locale: ContentfulLocale.es })
        .reply(200, mockHomepageBannerEntry)
        .get(
          `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockHomepageBannerEntry.sys.id}/`
        )
        .query({ locale: ContentfulLocale.zh })
        .reply(200, mockHomepageBannerEntry)

      const mockFieldsWithEntry = {
        reference: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: mockHomepageBannerEntry.sys.id
            }
          }
        }
      }

      const result = await client.fetchEntriesFromEntryFields(
        mockSpace,
        mockEnvironment,
        mockFieldsWithEntry
      )

      expect(result).toHaveProperty(mockHomepageBannerEntry.sys.id)
      expect(Object.keys(result)).toHaveLength(1)
    })

    it('should return empty object when no entries are found', async () => {
      const result = await client.fetchEntriesFromEntryFields(
        mockSpace,
        mockEnvironment,
        {}
      )
      expect(result).toEqual({})
    })
  })
})
