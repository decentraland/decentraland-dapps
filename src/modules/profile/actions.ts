import { action } from 'typesafe-actions'
import { Profile } from './types'

// Load project profile

export const LOAD_PROFILE_REQUEST = '[Request] Load profile'
export const LOAD_PROFILE_SUCCESS = '[Success] Load profile'
export const LOAD_PROFILE_FAILURE = '[Failure] Load profile'

export const loadProfileRequest = (address: string) =>
  action(LOAD_PROFILE_REQUEST, { address })
export const loadProfileSuccess = (address: string, profile: Profile) =>
  action(LOAD_PROFILE_SUCCESS, { address, profile })
export const loadProfileFailure = (address: string, error: string) =>
  action(LOAD_PROFILE_FAILURE, { address, error })

export type LoadProfileRequestAction = ReturnType<typeof loadProfileRequest>
export type LoadProfileSuccessAction = ReturnType<typeof loadProfileSuccess>
export type LoadProfileFailureAction = ReturnType<typeof loadProfileFailure>

// Set profile alias

export const SET_PROFILE_AVATAR_ALIAS_REQUEST =
  '[Request] Set profile avatar alias'
export const SET_PROFILE_AVATAR_ALIAS_SUCCESS =
  '[Success] Set profile avatar alias'
export const SET_PROFILE_AVATAR_ALIAS_FAILURE =
  '[Failure] Set profile avatar alias'

export const setProfileAvatarAliasRequest = (address: string, alias: string) =>
  action(SET_PROFILE_AVATAR_ALIAS_REQUEST, { address, alias })
export const setProfileAvatarAliasSuccess = (
  address: string,
  alias: string,
  version: number
) =>
  action(SET_PROFILE_AVATAR_ALIAS_SUCCESS, {
    address,
    alias,
    version
  })
export const setProfileAvatarAliasFailure = (address: string, error: string) =>
  action(SET_PROFILE_AVATAR_ALIAS_FAILURE, { address, error })

export type SetProfileAvatarAliasRequestAction = ReturnType<
  typeof setProfileAvatarAliasRequest
>
export type SetProfileAvatarAliasSuccessAction = ReturnType<
  typeof setProfileAvatarAliasSuccess
>
export type SetProfileAvatarAliasFailureAction = ReturnType<
  typeof setProfileAvatarAliasFailure
>

// Set profile description

export const SET_PROFILE_AVATAR_DESCRIPTION_REQUEST =
  '[Request] Set profile avatar description'
export const SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS =
  '[Success] Set profile avatar description'
export const SET_PROFILE_AVATAR_DESCRIPTION_FAILURE =
  '[Failure] Set profile avatar description'

export const setProfileAvatarDescriptionRequest = (
  address: string,
  description: string
) => action(SET_PROFILE_AVATAR_DESCRIPTION_REQUEST, { address, description })
export const setProfileAvatarDescriptionSuccess = (
  address: string,
  description: string,
  version: number
) =>
  action(SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS, {
    address,
    description,
    version
  })
export const setProfileAvatarDescriptionFailure = (
  address: string,
  error: string
) => action(SET_PROFILE_AVATAR_DESCRIPTION_FAILURE, { address, error })

export type SetProfileAvatarDescriptionRequestAction = ReturnType<
  typeof setProfileAvatarDescriptionRequest
>
export type SetProfileAvatarDescriptionSuccessAction = ReturnType<
  typeof setProfileAvatarDescriptionSuccess
>
export type SetProfileAvatarDescriptionFailureAction = ReturnType<
  typeof setProfileAvatarDescriptionFailure
>

// Errors

export const CLEAR_PROFILE_ERROR = '[Clear] Clear profile error'

export const clearProfileError = () => action(CLEAR_PROFILE_ERROR)

export type ClearProfileErrorAction = ReturnType<typeof clearProfileError>

// Change Profile

export const CHANGE_PROFILE = 'Change Profile'
export const changeProfile = (address: string, profile: Profile) =>
  action(CHANGE_PROFILE, { address, profile })
export type ChangeProfileAction = ReturnType<typeof changeProfile>
