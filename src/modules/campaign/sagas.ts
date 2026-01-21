import { call, put, takeEvery } from "redux-saga/effects";
import {
  BannerFields,
  CampaignFields,
  ContentfulAsset,
  ContentfulEntry,
  ContentfulLocale,
  LocalizedField,
  LocalizedFields,
  MarketingAdminFields,
  SysLink,
  isSysLink,
} from "@dcl/schemas";
import { isErrorWithMessage } from "../../lib";
import {
  FETCH_CAMPAIGN_REQUEST,
  FetchCampaignRequestAction,
  fetchCampaignFailure,
  fetchCampaignSuccess,
} from "./actions";
import { ContentfulClient } from "./ContentfulClient";

const BANNER_CONTENT_TYPE = "banner";
const MARKETING_CAMPAIGN_CONTENT_TYPE = "marketingCampaign";

export function* campaignSagas(
  client: ContentfulClient,
  config: {
    space: string;
    environment: string;
    id: string;
  },
) {
  yield takeEvery(FETCH_CAMPAIGN_REQUEST, handleFetchCampaignRequest);

  function* handleFetchCampaignRequest(_: FetchCampaignRequestAction) {
    try {
      const { fields } = (yield call(
        [client, "fetchEntryAllLocales"],
        config.space,
        config.environment,
        config.id,
      )) as ContentfulEntry<MarketingAdminFields>;

      if (!fields) {
        throw new Error("Failed to fetch campaign data");
      }
      const entries = (yield call(
        [client, "fetchEntriesFromEntryFields"],
        config.space,
        config.environment,
        fields,
      )) as Record<string, ContentfulEntry<LocalizedFields>>;

      const arrayOfFields = [
        fields as LocalizedFields,
        ...Object.values(entries).map((entry) => entry.fields),
      ];

      const assets = (yield call(
        [client, "fetchAssetsFromEntryFields"],
        config.space,
        config.environment,
        arrayOfFields,
      )) as Record<string, ContentfulAsset>;

      const banners = Object.entries(fields).reduce(
        (acc, [key, value]) => {
          const fieldOnLocale = value[ContentfulLocale.enUS];
          if (isSysLink(fieldOnLocale)) {
            const linkedEntryId = fieldOnLocale.sys.id;
            const bannerEntry = Object.values(entries).find(
              (entry) => entry.sys.id === linkedEntryId,
            );
            if (
              bannerEntry &&
              bannerEntry.sys.contentType.sys.id === BANNER_CONTENT_TYPE
            ) {
              acc[key] = {
                ...bannerEntry.fields,
                id: linkedEntryId,
              } as BannerFields & { id: string };
            }
          }
          return acc;
        },
        {} as Record<string, BannerFields & { id: string }>,
      );

      const campaignField = Object.values(fields).find((field) => {
        const fieldOnLocale = field[ContentfulLocale.enUS];
        if (isSysLink(fieldOnLocale)) {
          const entry = Object.values(entries).find(
            (entry) => entry.sys.id === fieldOnLocale.sys.id,
          );
          if (
            entry &&
            entry.sys.contentType.sys.id === MARKETING_CAMPAIGN_CONTENT_TYPE
          ) {
            return entry.fields as CampaignFields;
          }
        }
        return false;
      }) as LocalizedField<SysLink<"Entry">> | undefined;
      const campaignFields = campaignField?.[ContentfulLocale.enUS].sys.id
        ? (entries[campaignField?.[ContentfulLocale.enUS].sys.id]
            .fields as CampaignFields)
        : undefined;

      yield put(
        fetchCampaignSuccess(
          banners,
          assets,
          campaignFields?.name,
          campaignFields?.marketplaceTabName,
          campaignFields?.mainTag?.[ContentfulLocale.enUS],
          campaignFields?.additionalTags?.[ContentfulLocale.enUS],
        ),
      );
    } catch (error) {
      yield put(
        fetchCampaignFailure(
          isErrorWithMessage(error) ? error.message : "Error fetching campaign",
        ),
      );
    }
  }
}
