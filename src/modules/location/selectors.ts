export const hasRouter = (state: any) => !!state.router

export const getLocation = (state: any) =>
  hasRouter(state) && state.router.location

export const getPathname = (state: any) => {
  if (!hasRouter(state)) {
    return null
  }
  const location = getLocation(state)
  if (!location) {
    return null
  }
  return location.pathname
}

export const getPathAction = (state: any) => {
  if (!hasRouter(state)) {
    return null
  }
  const pathname = getPathname(state)
  if (!pathname) {
    return null
  }
  return pathname.split('/').pop()
}
