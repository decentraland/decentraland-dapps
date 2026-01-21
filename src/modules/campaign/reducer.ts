import { loadingReducer } from "../loading/reducer";
import {
  FETCH_CAMPAIGN_FAILURE,
  FETCH_CAMPAIGN_REQUEST,
  FETCH_CAMPAIGN_SUCCESS,
} from "./actions";
import { CampaignAction, CampaignState } from "./types";

const INITIAL_STATE: CampaignState = {
  data: null,
  loading: [],
  error: null,
};

export function campaignReducer(
  state = INITIAL_STATE,
  action: CampaignAction,
): CampaignState {
  switch (action.type) {
    case FETCH_CAMPAIGN_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      };
    }
    case FETCH_CAMPAIGN_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: action.payload,
        error: null,
      };
    }
    case FETCH_CAMPAIGN_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
      };
    }
    default:
      return state;
  }
}
