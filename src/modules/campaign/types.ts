import { ActionType } from 'typesafe-actions'
import { BannerFields, ContentfulAsset, LocalizedField } from '@dcl/schemas'
import { LoadingState } from '../loading/reducer'
import * as actions from './actions'

export type CampaignState = {
  data: {
    name?: LocalizedField<string>
    tabName?: LocalizedField<string>
    mainTag?: string
    additionalTags?: string[]
    /** Items the campaign names ONE BY ONE, on top of whatever its tags and collections resolve to. */
    itemIds?: string[]
    /** Collections the campaign names one by one, for the ones nobody can tag in the builder. */
    collectionIds?: string[]
    banners: Record<string, BannerFields & { id: string }>
    assets: Record<string, ContentfulAsset>
  } | null
  loading: LoadingState
  error: string | null
}

export type CampaignAction = ActionType<typeof actions>
