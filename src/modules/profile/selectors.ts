import { AnyAction } from 'redux'
import { isLoadingType } from '../loading/selectors'
import {
  LOAD_PROFILES_REQUEST,
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  LoadProfilesRequestAction,
  SET_PROFILE_AVATAR_ALIAS_REQUEST,
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
} from './actions'
import { ProfileState } from './reducer'
import { Profile } from './types'

const isFetchProfileAction = (
  action: AnyAction,
): action is LoadProfileRequestAction => action.type === LOAD_PROFILE_REQUEST

const isFetchProfilesAction = (
  action: AnyAction,
): action is LoadProfilesRequestAction => action.type === LOAD_PROFILES_REQUEST

export const getState: (state: any) => ProfileState = (state) => state.profile

export const getData: (state: any) => ProfileState['data'] = (state) =>
  getState(state).data

export const getError: (state: any) => ProfileState['error'] = (state) =>
  getState(state).error

export const getLoading = (state: any) => getState(state).loading

export const getProfileOfAddress = (
  state: any,
  address: string,
): Profile | undefined => getData(state)[address]

export const getProfileOfAddresses = (
  state: any,
  addresses: string[],
): Profile[] =>
  addresses
    .map((address) => getProfileOfAddress(state, address))
    .filter(Boolean) as Profile[]

export const isLoadingSetProfileAvatarDescription = (state: any) =>
  isLoadingType(getLoading(state), SET_PROFILE_AVATAR_DESCRIPTION_REQUEST)

export const isLoadingSetProfileAvatarAlias = (state: any) =>
  isLoadingType(getLoading(state), SET_PROFILE_AVATAR_ALIAS_REQUEST)

export const getProfileError = (state: any): string | null =>
  getState(state).error

export const getProfilesBeingLoaded = (state: any): string[] => {
  return [
    ...getLoading(state)
      .filter(isFetchProfileAction)
      .map((action) => action.payload.address),
    ...getLoading(state)
      .filter(isFetchProfilesAction)
      .flatMap((action) => action.payload.addresses),
  ]
}

export const isLoadingProfile = (state: any, address: string) =>
  getProfilesBeingLoaded(state).includes(address.toLowerCase())

export const isLoadingSomeProfiles = (state: any, addresses: string[]) =>
  getProfilesBeingLoaded(state).some((address) => addresses.includes(address))

export const isLoadingAllProfiles = (state: any, addresses: string[]) => {
  const profilesBeingLoaded = getProfilesBeingLoaded(state)
  return addresses.every((address) =>
    profilesBeingLoaded.includes(address.toLowerCase()),
  )
}
