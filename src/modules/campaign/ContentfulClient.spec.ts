import nock from 'nock'
import { ContentfulClient } from './ContentfulClient'
import {
  mockAdminEntryEn,
  marketplaceHomepageBannerAssets,
  mockHomepageBannerEntry
} from '../../tests/contentfulMocks'
import { ContentfulLocale, LocalizedField } from '@dcl/schemas'
import { ContentfulEntryWithoutLocales } from './ContentfulClient.types'

const CMS_URL = 'https://cms.decentraland.org'

describe('ContentfulClient', () => {
  let client: ContentfulClient
  let mockSpace: string
  let mockEnvironment: string
  let mockId: string
  let mockFields: Record<string, any>
  let mockedEnResponse: ContentfulEntryWithoutLocales<any>
  let mockedEsResponse: ContentfulEntryWithoutLocales<any>
  let mockedZhResponse: ContentfulEntryWithoutLocales<any>

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

    const mockedEntrySys = {
      id: 'test-id',
      type: 'Entry' as const,
      space: {
        sys: {
          type: 'Link' as const,
          linkType: 'Space' as const,
          id: 'space1'
        }
      },
      createdAt: '2021-01-01',
      updatedAt: '2021-01-01',
      environment: {
        sys: {
          type: 'Link' as const,
          linkType: 'Environment' as const,
          id: 'env1'
        }
      },
      contentType: {
        sys: {
          type: 'Link' as const,
          linkType: 'ContentType' as const,
          id: 'content1'
        }
      },
      publishedVersion: 1,
      revision: 1
    }
    const mockedEntryMetadata = {
      tags: [],
      concepts: []
    }

    mockedEnResponse = {
      fields: { title: 'English Title' },
      metadata: mockedEntryMetadata,
      sys: mockedEntrySys
    }
    mockedEsResponse = {
      fields: { title: 'Título en Español' },
      metadata: mockedEntryMetadata,
      sys: mockedEntrySys
    }
    mockedZhResponse = {
      fields: { title: '中文标题' },
      metadata: mockedEntryMetadata,
      sys: mockedEntrySys
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
          .reply(200, mockAdminEntryEn)
      })

      it('should return the entry data', async () => {
        const result = await client.fetchEntry('space-id', 'env-id', 'entry-id')
        expect(result).toEqual(mockAdminEntryEn)
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
          .reply(200, mockedEnResponse)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}/`
          )
          .query({ locale: ContentfulLocale.es })
          .reply(200, mockedEsResponse)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/entries/${mockId}/`
          )
          .query({ locale: ContentfulLocale.zh })
          .reply(200, mockedZhResponse)
      })

      it('should combine fields from all available locales', async () => {
        const result = await client.fetchEntryAllLocales(
          mockSpace,
          mockEnvironment,
          mockId
        )

        expect(result).toEqual({
          fields: {
            title: {
              [ContentfulLocale.enUS]: 'English Title',
              [ContentfulLocale.es]: 'Título en Español',
              [ContentfulLocale.zh]: '中文标题'
            }
          },
          sys: mockedEnResponse.sys,
          metadata: mockedEnResponse.metadata
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
      beforeEach(() => {
        nock(CMS_URL)
          .get(
            `/spaces/${mockSpace}/environments/${mockEnvironment}/assets/${marketplaceHomepageBannerAssets[0].sys.id}/`
          )
          .reply(200, marketplaceHomepageBannerAssets[0])
      })

      it('should get all assets referenced in the entry fields', async () => {
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
    describe('when there are entries to fetch', () => {
      beforeEach(() => {
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
      })

      it('should fetch all entries referenced in the entry fields', async () => {
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

        expect(result).toEqual({
          [mockHomepageBannerEntry.sys.id]: {
            sys: mockHomepageBannerEntry.sys,
            metadata: mockHomepageBannerEntry.metadata,
            fields: Object.entries(mockHomepageBannerEntry.fields).reduce(
              (acc, [key, value]) => {
                acc[key] = {
                  ...acc[key],
                  [ContentfulLocale.enUS]: value,
                  [ContentfulLocale.es]: value,
                  [ContentfulLocale.zh]: value
                }
                return acc
              },
              {} as Record<string, LocalizedField<any>>
            )
          }
        })
        expect(Object.keys(result)).toHaveLength(1)
      })
    })

    describe('when there are no entries to fetch', () => {
      it('should return empty object', async () => {
        const result = await client.fetchEntriesFromEntryFields(
          mockSpace,
          mockEnvironment,
          {}
        )
        expect(result).toEqual({})
      })
    })
  })
})
