import { isLoadingType } from '../loading/selectors'
import { SET_PROFILE_AVATAR_DESCRIPTION_REQUEST } from './actions'
import { ProfileState } from './reducer'
import { Profile } from './types'

export const getState: (state: any) => ProfileState = state => state.profile

export const getData: (state: any) => ProfileState['data'] = state =>
  getState(state).data

export const getError: (state: any) => ProfileState['error'] = state =>
  getState(state).error

export const getLoading = (state: any) => getState(state).loading

export const getProfileOfAddress = (
  state: any,
  address: string
): Profile | undefined => getData(state)[address]

export const isLoadingSetProfileAvatarDescription = (state: any) =>
  isLoadingType(getLoading(state), SET_PROFILE_AVATAR_DESCRIPTION_REQUEST)

export const getProfileError = (state: any): string | null =>
  getState(state).error
