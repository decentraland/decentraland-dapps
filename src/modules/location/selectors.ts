import { RouterState } from 'react-router-redux'
import { Locations } from './types'
import { LocationState } from '../../../node_modules/@types/history'

export const hasRouter = (state: any): boolean => !!state.router

export const getLocation = (state: any): RouterState['location'] | null =>
  hasRouter(state) ? (state.router as RouterState).location : null

export const getPathname = (state: any): string | null => {
  if (!hasRouter(state)) {
    return null
  }
  const location = getLocation(state)
  if (!location) {
    return null
  }
  return location.pathname
}

export const getPathAction = (state: any): string | null => {
  if (!hasRouter(state)) {
    return null
  }
  const pathname = getPathname(state)
  if (!pathname) {
    return null
  }
  return pathname.split('/').pop() as string | null
}

export const getState = (state: any): LocationState => state.location

export const getLocations = (state: any): Locations => getState(state).locations

export const isSignIn = (state: any): boolean => {
  const pathname = getPathname(state)
  return pathname === getLocations(state).signIn
}

export const isRoot = (state: any): boolean => {
  const pathname = getPathname(state)
  return pathname === getLocations(state).root
}
