// import { createSelector } from 'reselect'
import { getAddress } from '../wallet/selectors'
import { isValid } from './utils'

export const getState = (state: any) => state.identity
export const getData = (state: any) => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const getError = (state: any) => getState(state).error

export const getCurrentIdentity = (state: any) => {
  const identities = getData(state)
  const address = getAddress(state)
  if (!address) {
    return null
  }

  const identity = identities[address]

  if (!isValid(identity)) {
    return null
  }

  return identity
}
