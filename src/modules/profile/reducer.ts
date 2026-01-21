import { LoadingState, loadingReducer } from "../loading/reducer";
import {
  CHANGE_PROFILE,
  CLEAR_PROFILE_ERROR,
  ChangeProfileAction,
  ClearProfileErrorAction,
  LOAD_PROFILES_FAILURE,
  LOAD_PROFILES_REQUEST,
  LOAD_PROFILES_SUCCESS,
  LOAD_PROFILE_FAILURE,
  LOAD_PROFILE_REQUEST,
  LOAD_PROFILE_SUCCESS,
  LoadProfileFailureAction,
  LoadProfileRequestAction,
  LoadProfileSuccessAction,
  LoadProfilesFailureAction,
  LoadProfilesRequestAction,
  LoadProfilesSuccessAction,
  SET_PROFILE_AVATAR_ALIAS_FAILURE,
  SET_PROFILE_AVATAR_ALIAS_REQUEST,
  SET_PROFILE_AVATAR_ALIAS_SUCCESS,
  SET_PROFILE_AVATAR_DESCRIPTION_FAILURE,
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
  SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS,
  SetProfileAvatarAliasFailureAction,
  SetProfileAvatarAliasRequestAction,
  SetProfileAvatarAliasSuccessAction,
  SetProfileAvatarDescriptionFailureAction,
  SetProfileAvatarDescriptionRequestAction,
  SetProfileAvatarDescriptionSuccessAction,
} from "./actions";
import { Profile } from "./types";

export type ProfileState = {
  data: Record<string, Profile>;
  loading: LoadingState;
  error: string | null;
};

export const INITIAL_STATE: ProfileState = {
  data: {},
  loading: [],
  error: null,
};

export type ProfileReducerAction =
  | LoadProfileRequestAction
  | LoadProfileSuccessAction
  | LoadProfileFailureAction
  | LoadProfilesRequestAction
  | LoadProfilesFailureAction
  | LoadProfilesSuccessAction
  | ChangeProfileAction
  | SetProfileAvatarDescriptionRequestAction
  | SetProfileAvatarDescriptionSuccessAction
  | SetProfileAvatarDescriptionFailureAction
  | ClearProfileErrorAction
  | SetProfileAvatarAliasRequestAction
  | SetProfileAvatarAliasSuccessAction
  | SetProfileAvatarAliasFailureAction;

export const profileReducer = (
  state = INITIAL_STATE,
  action: ProfileReducerAction,
): ProfileState => {
  switch (action.type) {
    case SET_PROFILE_AVATAR_DESCRIPTION_REQUEST:
    case SET_PROFILE_AVATAR_ALIAS_REQUEST:
    case LOAD_PROFILE_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      };
    }
    case LOAD_PROFILES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      };
    }
    case SET_PROFILE_AVATAR_DESCRIPTION_FAILURE:
    case SET_PROFILE_AVATAR_ALIAS_FAILURE:
    case LOAD_PROFILES_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
      };
    }
    case LOAD_PROFILE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
      };
    }
    case SET_PROFILE_AVATAR_ALIAS_SUCCESS: {
      const { address, alias, version } = action.payload;
      const newAvatar = {
        ...state.data[address].avatars[0],
        hasClaimedName: true,
        version,
        name: alias,
      };

      return {
        ...state,
        data: {
          ...state.data,
          [address]: {
            ...state.data[address],
            avatars: [newAvatar, ...state.data[address].avatars.slice(1)],
          },
        },
        loading: loadingReducer(state.loading, action),
      };
    }
    case SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS: {
      const { address, description, version } = action.payload;
      const newAvatar = {
        ...state.data[address].avatars[0],
        description,
        version,
      };

      return {
        ...state,
        data: {
          ...state.data,
          [address]: {
            ...state.data[address],
            avatars: [newAvatar, ...state.data[address].avatars.slice(1)],
          },
        },
        loading: loadingReducer(state.loading, action),
      };
    }
    case LOAD_PROFILE_SUCCESS: {
      const { address, profile } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [address]: profile,
        },
        loading: loadingReducer(state.loading, action),
      };
    }
    case LOAD_PROFILES_SUCCESS: {
      const profiles = action.payload.profiles;
      const data = profiles.reduce(
        (acc, profile) => ({
          ...acc,
          [profile.avatars[0].userId]: profile,
        }),
        {},
      );
      return {
        ...state,
        data: {
          ...state.data,
          ...data,
        },
        loading: loadingReducer(state.loading, action),
      };
    }
    case CHANGE_PROFILE: {
      const { address, profile } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [address]: { ...state.data[address], ...profile },
        },
      };
    }
    case CLEAR_PROFILE_ERROR: {
      return {
        ...state,
        error: null,
      };
    }

    default:
      return state;
  }
};
