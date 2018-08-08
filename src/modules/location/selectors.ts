import { RouterState } from 'react-router-redux'

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
