import {
  ContentfulResponse,
  LocalizedField,
  LocalizedFieldType
} from '@dcl/schemas'
import { BaseClient } from '../../lib'

export class ContentfulClient extends BaseClient {
  constructor() {
    super('https://cdn.contentful.com')
  }

  async fetchEntry<
    T extends Record<string, LocalizedField<LocalizedFieldType>>
  >(
    space: string,
    environment: string,
    id: string,
    contentType: string,
    token: string
  ): Promise<ContentfulResponse<T>> {
    const response = await this.rawFetch(
      `/spaces/${space}/environments/${environment}/entries/?` +
        new URLSearchParams({
          'sys.id': id,
          content_type: contentType,
          locale: '*'
        }),
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch entity data')
    }

    return response.json()
  }
}
