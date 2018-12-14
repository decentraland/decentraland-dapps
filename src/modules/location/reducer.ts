import { Locations } from './types'

export type LocationState = {
  locations: Locations
}

export const defaultLocations: Locations = {
  root: '/',
  signIn: '/sign-in'
}

export function createLocationReducer(options: Partial<Locations> = {}) {
  const locations: Locations = Object.assign({}, defaultLocations, options)

  const INITIAL_STATE: LocationState = { locations }
  return function locationReducer(state: LocationState = INITIAL_STATE) {
    return state
  }
}

export const locationReducer = createLocationReducer()
