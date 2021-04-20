import { createSelector } from 'reselect'
import { ProfileState } from './reducer'
import { getAddress } from '../wallet/selectors'

export const getState: (state: any) => ProfileState = state => state.profile

export const getData: (state: any) => ProfileState['data'] = state =>
  getState(state).data

export const getError: (state: any) => ProfileState['error'] = state =>
  getState(state).error

export const getLoading = (state: any) => getState(state).loading

export const getProfile = createSelector(
  getAddress,
  getData,
  (address, profiles) => {
    const profile = address && address in profiles ? profiles[address] : null
    return profile && profile.avatars.length > 0 ? profile.avatars[0] : null
  }
)

export const getName = createSelector(getProfile, avatar => {
  if (!avatar) {
    return null
  }
  return avatar && avatar.name ? avatar.name : null
})
