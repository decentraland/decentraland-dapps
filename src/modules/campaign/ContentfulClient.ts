import {
  ContentfulAsset,
  ContentfulEntry,
  ContentfulLocale,
  LocalizedField,
  LocalizedFieldType,
} from '@dcl/schemas'
import { BaseClient } from '../../lib'
import { ContentfulEntryWithoutLocales, Fields } from './ContentfulClient.types'

type ImageOptimizedFormats = Partial<{
  jpg: string
  png: string
  webp: string
  gif: string
}>

type ImageOptimized = ImageOptimizedFormats &
  Partial<{
    original: string
    originalFormat: keyof ImageOptimizedFormats
    optimized: string
  }>

export class ContentfulClient extends BaseClient {
  constructor() {
    super('https://cms.decentraland.org')
  }

  async fetchEntry<T extends Fields>(
    space: string,
    environment: string,
    id: string,
    locale: ContentfulLocale = ContentfulLocale.enUS,
  ): Promise<ContentfulEntryWithoutLocales<T>> {
    const response = await this.rawFetch(
      `/spaces/${space}/environments/${environment}/entries/${id}/?` +
        new URLSearchParams({
          locale: locale,
        }),
    )

    if (!response.ok) {
      throw new Error('Failed to fetch entity data')
    }

    return response.json()
  }

  private mergeEntriesWithoutLocales<T extends Fields>(
    content: {
      entry: ContentfulEntryWithoutLocales<T>
      locale: ContentfulLocale
    }[],
  ): ContentfulEntry<T> {
    const combinedFields = {} as Record<
      string,
      LocalizedField<LocalizedFieldType>
    >

    for (const { entry, locale } of content) {
      Object.entries(entry.fields).forEach(([key, value]) => {
        combinedFields[key] = {
          ...combinedFields[key],
          [locale]: value,
        }
      })
    }
    return {
      fields: combinedFields as T,
      metadata: content[0].entry.metadata,
      sys: content[0].entry.sys,
    }
  }

  async fetchEntryAllLocales<
    T extends Record<string, LocalizedField<LocalizedFieldType>>,
  >(
    space: string,
    environment: string,
    id: string,
  ): Promise<ContentfulEntry<T>> {
    try {
      try {
        const [responseEn, responseEs, responseZh] = await Promise.all([
          this.fetchEntry(space, environment, id, ContentfulLocale.enUS),
          this.fetchEntry(space, environment, id, ContentfulLocale.es),
          this.fetchEntry(space, environment, id, ContentfulLocale.zh),
        ])

        return this.mergeEntriesWithoutLocales<T>([
          {
            entry: responseEn as ContentfulEntryWithoutLocales<T>,
            locale: ContentfulLocale.enUS,
          },
          {
            entry: responseEs as ContentfulEntryWithoutLocales<T>,
            locale: ContentfulLocale.es,
          },
          {
            entry: responseZh as ContentfulEntryWithoutLocales<T>,
            locale: ContentfulLocale.zh,
          },
        ])
      } catch {
        throw new Error('Error fetching entry in all locales')
      }
    } catch {
      throw new Error('Error fetching entry in all locales')
    }
  }

  isWebpSupported() {
    const elem =
      typeof document !== 'undefined' && document.createElement('canvas')
    if (elem && elem.getContext && elem.getContext('2d')) {
      // was able or not to get WebP representation
      return elem.toDataURL('image/webp').startsWith('data:image/webp')
    }

    // very old browser like IE 8, canvas not supported
    return false
  }

  private optimize(image?: string | null): ImageOptimized {
    if (!image) {
      return {}
    }

    try {
      if (image.startsWith('//')) {
        image = `https:${image}`
      }

      const url = new URL(image)
      url.hostname = 'cms-images.decentraland.org'
      url.searchParams.set('q', '80')

      const jpg = new URL(url)
      jpg.searchParams.set('fm', 'jpg')
      jpg.searchParams.set('fl', 'progressive')

      const png = new URL(url)
      png.searchParams.set('fm', 'png')

      const webp = new URL(url)
      webp.searchParams.set('fm', 'webp')

      const gif = new URL(url)
      gif.searchParams.set('fm', 'gif')

      const optimized =
        url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg')
          ? this.isWebpSupported()
            ? webp
            : jpg
          : url.pathname.endsWith('.webp')
            ? webp
            : url.pathname.endsWith('.png')
              ? png
              : url.pathname.endsWith('.gif')
                ? gif
                : undefined

      const originalFormat =
        url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg')
          ? 'jpg'
          : url.pathname.endsWith('.png')
            ? 'png'
            : url.pathname.endsWith('.webp')
              ? 'webp'
              : url.pathname.endsWith('.gif')
                ? 'gif'
                : undefined

      return {
        jpg: jpg.toString(),
        png: png.toString(),
        webp: webp.toString(),
        gif: gif.toString(),
        original: url.toString(),
        optimized: optimized && optimized.toString(),
        originalFormat,
      }
    } catch (err) {
      console.error('Error optimizing:', image, err)
      return {}
    }
  }

  async fetchAsset(
    space: string,
    environment: string,
    id: string,
  ): Promise<ContentfulAsset> {
    const response = await this.rawFetch(
      `/spaces/${space}/environments/${environment}/assets/${id}/`,
    )

    if (!response.ok) {
      throw new Error('Failed to fetch asset data')
    }

    const asset = await response.json()

    const locale = ContentfulLocale.enUS
    const transformedFields = {
      title: {
        [locale]: asset.fields.title,
      },
      description: {
        [locale]: asset.fields.description,
      },
      file: {
        [locale]: {
          ...asset.fields.file,
          url:
            this.optimize(asset.fields.file.url).optimized ||
            asset.fields.file.url,
        },
      },
    }

    return {
      ...asset,
      fields: transformedFields,
    }
  }

  async fetchAssetsFromEntryFields<
    T extends Record<string, LocalizedField<LocalizedFieldType>>,
  >(
    space: string,
    environment: string,
    fieldsInArray: T[],
  ): Promise<Record<string, ContentfulAsset>> {
    const assetIds = new Set<string>()
    fieldsInArray.forEach((fields) => {
      Object.values(fields).forEach((field) => {
        Object.values(field).forEach((content) => {
          if (content?.sys?.linkType === 'Asset') {
            assetIds.add(content.sys.id)
          }
        })
      })
    })

    if (assetIds.size === 0) {
      return {}
    }

    const assets = await Promise.all(
      Array.from(assetIds).map((id) => this.fetchAsset(space, environment, id)),
    )

    return assets.reduce(
      (acc, asset) => {
        acc[asset.sys.id] = asset
        return acc
      },
      {} as Record<string, ContentfulAsset>,
    )
  }

  async fetchEntriesFromEntryFields<
    T extends Record<string, LocalizedField<LocalizedFieldType>>,
  >(
    space: string,
    environment: string,
    fields: T,
  ): Promise<Record<string, ContentfulEntry<T>>> {
    const entryIds = new Set<string>()

    Object.values(fields).forEach((field) => {
      Object.values(field).forEach((content) => {
        if (content?.sys?.linkType === 'Entry') {
          entryIds.add(content.sys.id)
        }
      })
    })

    if (entryIds.size === 0) {
      return {}
    }

    const entries = await Promise.all(
      Array.from(entryIds).map((id) =>
        this.fetchEntryAllLocales<T>(space, environment, id),
      ),
    )

    return entries.reduce(
      (acc, entry) => {
        acc[entry.sys.id] = entry
        return acc
      },
      {} as Record<string, ContentfulEntry<T>>,
    )
  }
}
