import { action } from 'typesafe-actions'
import { BannerFields, ContentfulAsset, LocalizedField } from '@dcl/schemas'

export const FETCH_CAMPAIGN_REQUEST = '[Request] Fetch Campaign'
export const FETCH_CAMPAIGN_SUCCESS = '[Success] Fetch Campaign'
export const FETCH_CAMPAIGN_FAILURE = '[Failure] Fetch Campaign'

export const fetchCampaignRequest = () => action(FETCH_CAMPAIGN_REQUEST)

export const fetchCampaignSuccess = (
  banners: Record<string, BannerFields>,
  assets: Record<string, ContentfulAsset>,
  name?: LocalizedField<string>,
  tabName?: LocalizedField<string>,
  mainTag?: string,
  additionalTags?: string[]
) =>
  action(FETCH_CAMPAIGN_SUCCESS, {
    name,
    tabName,
    mainTag,
    additionalTags,
    banners,
    assets
  })

export const fetchCampaignFailure = (error: string) =>
  action(FETCH_CAMPAIGN_FAILURE, { error })

export type FetchCampaignRequestAction = ReturnType<typeof fetchCampaignRequest>
export type FetchCampaignSuccessAction = ReturnType<typeof fetchCampaignSuccess>
export type FetchCampaignFailureAction = ReturnType<typeof fetchCampaignFailure>
