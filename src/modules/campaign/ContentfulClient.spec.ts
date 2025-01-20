import { ContentfulResponse } from '@dcl/schemas'
import { ContentfulClient } from './ContentfulClient'
import { mockHomepageBannerEntry } from '../../tests/contentfulMocks'

describe('ContentfulClient', () => {
  let client: ContentfulClient

  beforeEach(() => {
    client = new ContentfulClient()
  })

  describe('fetchEntry', () => {
    const mockSpace = 'test-space'
    const mockEnvironment = 'test-env'
    const mockId = 'test-id'
    const mockContentType = 'test-content-type'
    const mockToken = 'test-token'

    describe('when the request is successful', () => {
      let mockResponse: ContentfulResponse<any>
      beforeEach(() => {
        mockResponse = {
          items: [{ ...mockHomepageBannerEntry }],
          includes: {
            Asset: [],
            Entry: []
          }
        }
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      })

      it('should have fetched the entry with the given parameters', async () => {
        await client.fetchEntry(
          mockSpace,
          mockEnvironment,
          mockId,
          mockContentType,
          mockToken
        )

        expect(fetch).toHaveBeenCalledWith(
          `https://cdn.contentful.com/spaces/${mockSpace}/environments/${mockEnvironment}/entries/?sys.id=${mockId}&content_type=${mockContentType}&locale=*`,
          {
            headers: {
              Authorization: `Bearer ${mockToken}`
            }
          }
        )
      })

      it('should return the parsed response', async () => {
        const result = await client.fetchEntry(
          mockSpace,
          mockEnvironment,
          mockId,
          mockContentType,
          mockToken
        )

        expect(result).toEqual(mockResponse)
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false
        })
      })

      it('should throw an error', async () => {
        await expect(
          client.fetchEntry(
            mockSpace,
            mockEnvironment,
            mockId,
            mockContentType,
            mockToken
          )
        ).rejects.toThrow('Failed to fetch entity data')
      })
    })
  })
})
