import { RootMiddleware } from '../../types'
import { AnalyticsSnippetOptions, configureAnalyticsSnippet, getAnalyticsLoadOptions } from './snippet'
import { getAnalytics, track } from './utils'

const disabledMiddleware: RootMiddleware = _ => next => action => {
  next(action)
}

export function createAnalyticsMiddleware(apiKey: string, options?: AnalyticsSnippetOptions): RootMiddleware {
  if (!apiKey) {
    console.warn('Analytics: middleware disabled due to missing API key')
    return disabledMiddleware
  }

  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics: middleware disabled because `window.analytics` is not present')
    return disabledMiddleware
  }

  configureAnalyticsSnippet(options)
  // Passed explicitly because analytics.js may already be on the page, in which case `load` is its own and not the
  // snippet's, so it reads nothing from the options configured above
  analytics.load(apiKey, getAnalyticsLoadOptions())

  return _ => next => action => {
    track(action)
    next(action)
  }
}
