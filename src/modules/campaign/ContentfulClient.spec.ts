import nock from 'nock'
import { ContentfulClient } from './ContentfulClient'
import {
  mockAdminEntry,
  marketplaceHomepageBannerAssets,
  mockCampaignEntry,
  mockHomepageBannerEntry
} from '../../tests/contentfulMocks'
import { ContentfulLocale } from '@dcl/schemas'

const CMS_URL = 'https://cms.decentraland.org'

describe('ContentfulClient', () => {
  let client: ContentfulClient
  const mockSpace = 'test-space'
  const mockEnvironment = 'test-env'
  const mockId = 'test-id'

  beforeEach(() => {
    client = new ContentfulClient()
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
    it('should combine fields from all available locales', async () => {
      const mockResponses = {
        enUS: {
          fields: { title: { [ContentfulLocale.enUS]: 'English Title' } }
        },
        es: {
          fields: { title: { [ContentfulLocale.es]: 'Título en Español' } }
        },
        zh: { fields: { title: { [ContentfulLocale.zh]: '中文标题' } } }
      }

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses.enUS)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses.es)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses.zh)
        })

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

  describe('fetchAsset', () => {
    it('should fetch and transform an asset to the correct format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(marketplaceHomepageBannerAssets[0])
      })

      const result = await client.fetchAsset(mockSpace, mockEnvironment, mockId)

      expect(result.fields).toHaveProperty('title.en-US')
      expect(result.fields).toHaveProperty('description.en-US')
      expect(result.fields).toHaveProperty('file.en-US')
    })
  })

  describe('fetchAssetsFromEntryFields', () => {
    it('should fetch all assets referenced in the entry fields', async () => {
      const mockFields = {
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

    it('should return empty object when no assets are found', async () => {
      const result = await client.fetchAssetsFromEntryFields(
        mockSpace,
        mockEnvironment,
        []
      )
      expect(result).toEqual({})
    })
  })

  describe('fetchEntriesFromEntryFields', () => {
    it('should fetch all entries referenced in the entry fields', async () => {
      const mockFields = {
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

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHomepageBannerEntry)
      })

      const result = await client.fetchEntriesFromEntryFields(
        mockSpace,
        mockEnvironment,
        mockFields
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
