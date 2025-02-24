import { ContentfulClient } from './ContentfulClient'
import {
  mockAsset,
  mockCampaignEntry,
  mockHomepageBannerEntry
} from '../../tests/contentfulMocks'
import { ContentfulLocale } from '@dcl/schemas'

describe('ContentfulClient', () => {
  let client: ContentfulClient
  const mockSpace = 'test-space'
  const mockEnvironment = 'test-env'
  const mockId = 'test-id'

  beforeEach(() => {
    client = new ContentfulClient()
    global.fetch = jest.fn()
  })

  describe('fetchEntry', () => {
    it('should fetch an entry with the given parameters', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignEntry)
      })

      const result = await client.fetchEntry(mockSpace, mockEnvironment, mockId)

      expect(result).toEqual(mockCampaignEntry)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}`
        ),
        expect.any(Object)
      )
    })

    it('should throw an error when the request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false })

      await expect(
        client.fetchEntry(mockSpace, mockEnvironment, mockId)
      ).rejects.toThrow('Failed to fetch entity data')
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
        json: () => Promise.resolve(mockAsset)
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
            sys: { type: 'Link', linkType: 'Asset', id: mockAsset.sys.id }
          }
        }
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAsset)
      })

      const result = await client.fetchAssetsFromEntryFields(
        mockSpace,
        mockEnvironment,
        mockFields
      )

      expect(result).toHaveProperty(mockAsset.sys.id)
      expect(Object.keys(result)).toHaveLength(1)
    })

    it('should return empty object when no assets are found', async () => {
      const result = await client.fetchAssetsFromEntryFields(
        mockSpace,
        mockEnvironment,
        {}
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
