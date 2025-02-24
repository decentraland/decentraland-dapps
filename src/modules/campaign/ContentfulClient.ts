import {
  ContentfulEntry,
  LocalizedField,
  LocalizedFieldType,
  ContentfulAsset,
  ContentfulLocale
} from '@dcl/schemas'
import { BaseClient } from '../../lib'

export class ContentfulClient extends BaseClient {
  constructor() {
    super('https://cms.decentraland.org')
  }

  async fetchEntry<
    T extends Record<string, LocalizedField<LocalizedFieldType>>
  >(
    space: string,
    environment: string,
    id: string,
    locale: ContentfulLocale = ContentfulLocale.enUS
  ): Promise<ContentfulEntry<T>> {
    const response = await this.rawFetch(
      `/spaces/${space}/environments/${environment}/entries/${id}/?` +
        new URLSearchParams({
          locale: locale
        })
    )

    if (!response.ok) {
      throw new Error('Failed to fetch entity data')
    }

    return response.json()
  }

  async fetchEntryAllLocales<
    T extends Record<string, LocalizedField<LocalizedFieldType>>
  >(space: string, environment: string, id: string): Promise<T> {
    try {
      const [responseEn, responseEs, responseZh] = await Promise.all([
        this.fetchEntry<T>(space, environment, id, ContentfulLocale.enUS),
        this.fetchEntry<T>(space, environment, id, ContentfulLocale.es),
        this.fetchEntry<T>(space, environment, id, ContentfulLocale.zh)
      ])

      const combinedFields = Object.entries(responseEn.fields).reduce<
        Record<string, LocalizedField<LocalizedFieldType>>
      >((acc, [key, value]) => {
        const field: Partial<LocalizedField<LocalizedFieldType>> = {
          [ContentfulLocale.enUS]: value[ContentfulLocale.enUS]
        }

        if (responseEs.fields[key]?.[ContentfulLocale.es]) {
          field[ContentfulLocale.es] =
            responseEs.fields[key][ContentfulLocale.es]
        }

        if (responseZh.fields[key]?.[ContentfulLocale.zh]) {
          field[ContentfulLocale.zh] =
            responseZh.fields[key][ContentfulLocale.zh]
        }

        acc[key] = field as LocalizedField<LocalizedFieldType>
        return acc
      }, {}) as T

      return combinedFields
    } catch (error) {
      throw new Error('Error fetching entry in all locales')
    }
  }

  async fetchAsset(
    space: string,
    environment: string,
    id: string
  ): Promise<ContentfulAsset> {
    const response = await this.rawFetch(
      `/spaces/${space}/environments/${environment}/assets/${id}/`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch asset data')
    }

    const asset = await response.json()

    const locale = ContentfulLocale.enUS
    const transformedFields = {
      title: {
        [locale]: asset.fields.title
      },
      description: {
        [locale]: asset.fields.description
      },
      file: {
        [locale]: asset.fields.file
      }
    }

    return {
      ...asset,
      fields: transformedFields
    }
  }

  async fetchAssetsFromEntryFields<
    T extends Record<string, LocalizedField<LocalizedFieldType>>
  >(
    space: string,
    environment: string,
    fields: T
  ): Promise<Record<string, ContentfulAsset>> {
    const assetIds = new Set<string>()

    Object.values(fields).forEach(field => {
      Object.values(field).forEach(content => {
        if (content?.sys?.linkType === 'Asset') {
          assetIds.add(content.sys.id)
        }
      })
    })

    if (assetIds.size === 0) {
      return {}
    }

    const assets = await Promise.all(
      Array.from(assetIds).map(id => this.fetchAsset(space, environment, id))
    )

    return assets.reduce((acc, asset) => {
      acc[asset.sys.id] = asset
      return acc
    }, {} as Record<string, ContentfulAsset>)
  }

  async fetchEntriesFromEntryFields<
    T extends Record<string, LocalizedField<LocalizedFieldType>>
  >(
    space: string,
    environment: string,
    fields: T
  ): Promise<Record<string, ContentfulEntry<T>>> {
    const entryIds = new Set<string>()

    Object.values(fields).forEach(field => {
      Object.values(field).forEach(content => {
        if (content?.sys?.linkType === 'Entry') {
          entryIds.add(content.sys.id)
        }
      })
    })

    if (entryIds.size === 0) {
      return {}
    }

    const entries = await Promise.all(
      Array.from(entryIds).map(id =>
        this.fetchEntryAllLocales<T>(space, environment, id).then(
          fields =>
            ({
              sys: { id },
              fields
            } as ContentfulEntry<T>)
        )
      )
    )

    return entries.reduce((acc, entry) => {
      acc[entry.sys.id] = entry
      return acc
    }, {} as Record<string, ContentfulEntry<T>>)
  }
}
