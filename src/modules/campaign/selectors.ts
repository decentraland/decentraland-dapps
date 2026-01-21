import {
  BannerFields,
  ContentfulAsset,
  ContentfulLocale,
  LocalizedField,
  isSysLink,
} from '@dcl/schemas'
import { type LoadingState, isLoadingType } from '../loading'
import { getLocale } from '../translation'
import { FETCH_CAMPAIGN_REQUEST } from './actions'
import { CampaignState } from './types'

const isLocalizedField = (value: any): value is LocalizedField<any> =>
  typeof value === 'object' && value !== null && 'en-US' in value

export const getState = (state: any): CampaignState => state.campaign
export const getData = (state: any): CampaignState['data'] | null =>
  getState(state).data
export const getLoading = (state: any): LoadingState => getState(state).loading
export const getError = (state: any): string | null => getState(state).error
export const isLoading = (state: any): boolean =>
  isLoadingType(getLoading(state), FETCH_CAMPAIGN_REQUEST)
export const getMainTag = (state: any): string | undefined =>
  getData(state)?.mainTag
export const getCampaignName = (state: any): LocalizedField<string> | null =>
  getData(state)?.name || null
export const getAdditionalTags = (state: any): string[] =>
  getData(state)?.additionalTags ?? []
export const getAllTags = (state: any): string[] => {
  const mainTag = getMainTag(state)
  const additionalTags = getAdditionalTags(state)
  return [mainTag, ...additionalTags].filter(Boolean) as string[]
}
export const getAssets = (state: any): Record<string, ContentfulAsset> | null =>
  getData(state)?.assets || null
export const getTabName = (state: any): LocalizedField<string> | null =>
  getData(state)?.tabName || null
export const getBanner = (
  state: any,
  id: string,
): (BannerFields & { id: string }) | null => {
  return getData(state)?.banners[id] ?? null
}
export const getBannerAssets = (
  state: any,
  bannerId: string,
): Record<string, ContentfulAsset> => {
  const assets = getAssets(state)
  const banner = getBanner(state, bannerId)

  if (!banner) return {}

  return Object.entries(banner).reduce(
    (acc, [_, value]) => {
      if (isLocalizedField(value)) {
        const usLocalizedValue = value['en-US']
        if (isSysLink(usLocalizedValue)) {
          const asset = assets?.[usLocalizedValue.sys.id]
          if (asset) {
            acc[usLocalizedValue.sys.id] = asset
          }
        }
      }
      return acc
    },
    {} as Record<string, ContentfulAsset>,
  )
}
export const getContentfulNormalizedLocale = (state: any): ContentfulLocale => {
  const storeLocale = getLocale(state)
  if (!['en', 'zh', 'es'].includes(storeLocale)) {
    return ContentfulLocale.enUS
  }
  return storeLocale === 'en'
    ? ContentfulLocale.enUS
    : (storeLocale as ContentfulLocale)
}
