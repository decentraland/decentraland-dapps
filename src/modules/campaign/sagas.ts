import { call, put, takeEvery } from 'redux-saga/effects'
import {
  BannerFields,
  CampaignFields,
  ContentfulAsset,
  ContentfulEntry,
  ContentfulResponse,
  ContentfulLocale,
  LocalizedField,
  LocalizedFields,
  MarketingAdminFields,
  SysLink,
  isSysLink
} from '@dcl/schemas'
import { isErrorWithMessage } from '../../lib'
import { FETCH_CAMPAIGN_REQUEST, FetchCampaignRequestAction } from './actions'
import { fetchCampaignSuccess, fetchCampaignFailure } from './actions'
import { ContentfulClient } from './ContentfulClient'

const ADMIN_CONTENT_TYPE = 'admin'
const BANNER_CONTENT_TYPE = 'banner'
const MARKETING_CAMPAIGN_CONTENT_TYPE = 'marketingCampaign'

export function* campaignSagas(
  client: ContentfulClient,
  config: {
    space: string
    environment: string
    id: string
    token: string
  }
) {
  yield takeEvery(FETCH_CAMPAIGN_REQUEST, handleFetchCampaignRequest)

  function* handleFetchCampaignRequest(_: FetchCampaignRequestAction) {
    try {
      const { items, includes } = (yield call(
        [client, 'fetchEntry'],
        config.space,
        config.environment,
        config.id,
        ADMIN_CONTENT_TYPE,
        config.token
      )) as ContentfulResponse<MarketingAdminFields>

      if (!items || (items && items.length === 0)) {
        throw new Error('Failed to fetch campaign data')
      }

      const assets = (includes.Asset ?? []).reduce((acc, asset) => {
        acc[asset.sys.id] = asset
        return acc
      }, {} as Record<string, ContentfulAsset>)

      const entries = (includes.Entry ?? []).reduce((acc, entry) => {
        acc[entry.sys.id] = entry
        return acc
      }, {} as Record<string, ContentfulEntry<LocalizedFields>>)

      const banners = Object.entries(items[0].fields).reduce(
        (acc, [key, value]) => {
          const fieldOnLocale = value[ContentfulLocale.enUS]
          if (isSysLink(fieldOnLocale)) {
            const linkedEntryId = fieldOnLocale.sys.id
            const bannerEntry = entries[linkedEntryId]
            if (
              bannerEntry &&
              bannerEntry.sys.contentType.sys.id === BANNER_CONTENT_TYPE
            ) {
              acc[key] = {
                ...bannerEntry.fields,
                id: linkedEntryId
              } as BannerFields & { id: string }
            }
          }
          return acc
        },
        {} as Record<string, BannerFields & { id: string }>
      )

      const campaignField = Object.values(items[0].fields).find(field => {
        const fieldOnLocale = field[ContentfulLocale.enUS]
        if (isSysLink(fieldOnLocale)) {
          const entry = entries[fieldOnLocale.sys.id]
          if (
            entry.sys.contentType.sys.id === MARKETING_CAMPAIGN_CONTENT_TYPE
          ) {
            return entry.fields as CampaignFields
          }
        }
        return false
      }) as LocalizedField<SysLink<'Entry'>> | undefined

      const campaignFields = campaignField?.[ContentfulLocale.enUS].sys.id
        ? (entries[campaignField?.[ContentfulLocale.enUS].sys.id]
            ?.fields as CampaignFields)
        : undefined

      yield put(
        fetchCampaignSuccess(
          banners,
          assets,
          campaignFields?.name,
          campaignFields?.marketplaceTabName,
          campaignFields?.mainTag?.[ContentfulLocale.enUS],
          campaignFields?.additionalTags?.[ContentfulLocale.enUS]
        )
      )
    } catch (error) {
      yield put(
        fetchCampaignFailure(
          isErrorWithMessage(error) ? error.message : 'Error fetching campaign'
        )
      )
    }
  }
}
