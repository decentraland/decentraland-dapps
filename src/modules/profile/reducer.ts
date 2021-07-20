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
  SET_PROFILE_DESCRIPTION_REQUEST,
  SET_PROFILE_DESCRIPTION_SUCCESS,
  SetProfileDescriptionRequestAction,
  SetProfileDescriptionSuccessAction,
  SetProfileDescriptionFailureAction,
  SET_PROFILE_DESCRIPTION_FAILURE
} from './actions'

export type ProfileState = {
  data: Record<string, Profile>
  loading: LoadingState
  error: Record<string, string>
}

export const INITIAL_STATE: ProfileState = {
  data: {},
  loading: [],
  error: {}
}

export type ProfileReducerAction =
  | LoadProfileRequestAction
  | LoadProfileSuccessAction
  | LoadProfileFailureAction
  | ChangeProfileAction
  | SetProfileDescriptionRequestAction
  | SetProfileDescriptionSuccessAction
  | SetProfileDescriptionFailureAction

export const profileReducer = (
  state = INITIAL_STATE,
  action: ProfileReducerAction
): ProfileState => {
  switch (action.type) {
    case SET_PROFILE_DESCRIPTION_REQUEST:
    case SET_PROFILE_DESCRIPTION_FAILURE:
    case LOAD_PROFILE_REQUEST:
    case LOAD_PROFILE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SET_PROFILE_DESCRIPTION_SUCCESS:
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
    // TODO: the profile only has an array of avatars, will it have more things than that?
    // This will go over the array of avatars, without doing a deep merge
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

    default:
      return state
  }
}
