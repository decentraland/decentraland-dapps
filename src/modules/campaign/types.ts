import { ContentfulAsset, BannerFields, LocalizedField } from '@dcl/schemas'
import { ActionType } from 'typesafe-actions'
import { LoadingState } from '../loading/reducer'
import * as actions from './actions'

export type CampaignState = {
  data: {
    name?: LocalizedField<string>
    tabName?: LocalizedField<string>
    mainTag?: string
    additionalTags?: string[]
    banners: Record<string, BannerFields>
    assets: Record<string, ContentfulAsset>
  } | null
  loading: LoadingState
  error: string | null
}

export type CampaignAction = ActionType<typeof actions>
