import { loadingReducer, LoadingState } from '../loading/reducer'
import { Profile } from './types'
import {
  LoadProfileRequestAction,
  LoadProfileSuccessAction,
  LoadProfileFailureAction,
  LOAD_PROFILE_REQUEST,
  LOAD_PROFILE_SUCCESS,
  LOAD_PROFILE_FAILURE,
  CHANGE_PROFILE,
  ChangeProfileAction,
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
  SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS,
  SetProfileAvatarDescriptionRequestAction,
  SetProfileAvatarDescriptionSuccessAction,
  SetProfileAvatarDescriptionFailureAction,
  SET_PROFILE_AVATAR_DESCRIPTION_FAILURE,
  CLEAR_PROFILE_ERROR,
  ClearProfileErrorAction
} from './actions'

export type ProfileState = {
  data: Record<string, Profile>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ProfileState = {
  data: {},
  loading: [],
  error: null
}

export type ProfileReducerAction =
  | LoadProfileRequestAction
  | LoadProfileSuccessAction
  | LoadProfileFailureAction
  | ChangeProfileAction
  | SetProfileAvatarDescriptionRequestAction
  | SetProfileAvatarDescriptionSuccessAction
  | SetProfileAvatarDescriptionFailureAction
  | ClearProfileErrorAction

export const profileReducer = (
  state = INITIAL_STATE,
  action: ProfileReducerAction
): ProfileState => {
  switch (action.type) {
    case SET_PROFILE_AVATAR_DESCRIPTION_REQUEST:
    case LOAD_PROFILE_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case SET_PROFILE_AVATAR_DESCRIPTION_FAILURE:
    case LOAD_PROFILE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS:
    case LOAD_PROFILE_SUCCESS: {
      const { address, profile } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [address]: profile
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case CHANGE_PROFILE: {
      const { address, profile } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [address]: { ...state.data[address], ...profile }
        }
      }
    }
    case CLEAR_PROFILE_ERROR: {
      return {
        ...state,
        error: null
      }
    }

    default:
      return state
  }
}
