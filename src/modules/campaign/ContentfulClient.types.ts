import { AlignmentFieldType, SysLink } from '@dcl/schemas'

type MarketingAdminFieldsWithoutLocales = {
  name: string
  campaign?: SysLink<'Entry'>
  marketplaceHomepageBanner?: SysLink<'Entry'>
  marketplaceCollectiblesBanner?: SysLink<'Entry'>
  marketplaceCampaignCollectiblesBanner?: SysLink<'Entry'>
  builderCampaignBanner?: SysLink<'Entry'>
}
type Fields = Record<string, any>

type ContentfulContentWithoutLocales<X extends 'Asset' | 'Entry', T> = {
  metadata: {
    tags: string[]
    concepts: string[]
  }
  sys: {
    space: SysLink<'Space'>
    id: string
    type: X
    createdAt: string
    updatedAt: string
    environment: SysLink<'Environment'>
    publishedVersion: number
    revision: number
  } & (X extends 'Entry'
    ? {
        contentType: SysLink<'ContentType'>
      }
    : {})
  fields: T
}

type ContentfulEntryWithoutLocales<T extends Fields> = ContentfulContentWithoutLocales<'Entry', T>

type ContentfulAssetWithoutLocales<T extends Fields> = ContentfulContentWithoutLocales<'Asset', T>

type BannerFieldsWithoutLocales = {
  desktopTitle: string
  desktopTitleAlignment: AlignmentFieldType
  mobileTitle: string
  mobileTitleAlignment: AlignmentFieldType
  desktopText: any
  desktopTextAlignment: AlignmentFieldType
  mobileText: any
  mobileTextAlignment: AlignmentFieldType
  showButton: boolean
  buttonLink?: string
  buttonsText?: string
  desktopButtonAlignment: AlignmentFieldType
  mobileButtonAlignment: AlignmentFieldType
  fullSizeBackground: SysLink<'Asset'>
  mobileBackground: SysLink<'Asset'>
  logo?: SysLink<'Asset'>
}

export type {
  MarketingAdminFieldsWithoutLocales,
  Fields,
  ContentfulContentWithoutLocales,
  ContentfulEntryWithoutLocales,
  ContentfulAssetWithoutLocales,
  BannerFieldsWithoutLocales
}
