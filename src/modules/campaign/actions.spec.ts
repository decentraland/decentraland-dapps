import { ContentfulAsset, BannerFields } from "@dcl/schemas";
import {
  marketplaceHomepageBannerAssets,
  mockHomepageBannerEntry,
} from "../../tests/contentfulMocks";
import {
  fetchCampaignRequest,
  fetchCampaignSuccess,
  fetchCampaignFailure,
  FETCH_CAMPAIGN_REQUEST,
  FETCH_CAMPAIGN_SUCCESS,
  FETCH_CAMPAIGN_FAILURE,
} from "./actions";

describe("Campaign actions", () => {
  describe("when fetching campaign data", () => {
    describe("when calling the request action creator", () => {
      let action: ReturnType<typeof fetchCampaignRequest>;
      let expectedAction: ReturnType<typeof fetchCampaignRequest>;

      beforeEach(() => {
        action = fetchCampaignRequest();
        expectedAction = {
          type: FETCH_CAMPAIGN_REQUEST,
        };
      });

      it("should return the request action", () => {
        expect(action).toEqual(expectedAction);
      });
    });

    describe("when calling the success action creator", () => {
      let action: ReturnType<typeof fetchCampaignSuccess>;
      let expectedAction: ReturnType<typeof fetchCampaignSuccess>;

      beforeEach(() => {
        const name = {
          "en-US": "Test Campaign",
        };
        const tabName = {
          "en-US": "Test Tab",
        };
        const mainTag = "main-tag";
        const additionalTags = ["tag1", "tag2"];
        const banners: Record<string, BannerFields> = {
          [mockHomepageBannerEntry.sys.id]: mockHomepageBannerEntry.fields,
        };
        const assets: Record<string, ContentfulAsset> = {
          [marketplaceHomepageBannerAssets[0].sys.id]:
            marketplaceHomepageBannerAssets[0],
        };
        action = fetchCampaignSuccess(
          banners,
          assets,
          name,
          tabName,
          mainTag,
          additionalTags,
        );
        expectedAction = {
          type: FETCH_CAMPAIGN_SUCCESS,
          payload: {
            name,
            tabName,
            mainTag,
            additionalTags,
            banners,
            assets,
          },
        };
      });

      it("should return the success action with the campaign data", () => {
        expect(action).toEqual(expectedAction);
      });
    });

    describe("when calling the failure action creator", () => {
      let action: ReturnType<typeof fetchCampaignFailure>;
      let expectedAction: ReturnType<typeof fetchCampaignFailure>;
      let error: string;

      beforeEach(() => {
        error = "Failed to fetch campaign";
        action = fetchCampaignFailure(error);
        expectedAction = {
          type: FETCH_CAMPAIGN_FAILURE,
          payload: {
            error,
          },
        };
      });

      it("should return the failure action with the error", () => {
        expect(action).toEqual(expectedAction);
      });
    });
  });
});
