import { AnyAction } from 'redux'
import { RootMiddleware } from '../../types'
import { getAnalytics, track } from './utils'

const disabledMiddleware: RootMiddleware = _ => next => action => {
  next(action)
}

export function createAnalyticsMiddleware(apiKey: string): RootMiddleware {
  if (!apiKey) {
    console.warn('Analytics: middleware disabled due to missing API key')
    return disabledMiddleware
  }

  const analytics = getAnalytics()
  if (!analytics) {
    console.warn(
      'Analytics: middleware disabled because `window.analytics` is not present'
    )
    return disabledMiddleware
  }

  analytics.load(apiKey)

  return _ => next => action => {
    track(action as AnyAction)
    next(action)
  }
}
