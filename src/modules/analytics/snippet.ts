export type AnalyticsSnippetOptions = {
  /**
   * URL of the analytics.js bundle. Defaults to Segment's CDN, which ad blockers drop, so dapps can point it at a
   * first party proxy instead.
   */
  analyticsUrl?: string
  /**
   * Origin analytics.js fetches its settings from. Defaults to the origin of `analyticsUrl`, which is what a proxy
   * serving both the bundle and the settings needs.
   */
  cdnUrl?: string
}

type SegmentSnippet = any[] & Record<string, any>

const GLOBAL_ANALYTICS_KEY = 'analytics'
const SNIPPET_VERSION = '5.2.0'

// Methods stubbed by the snippet, so calls made before analytics.js loads are queued and replayed afterwards
const METHODS = [
  'trackSubmit',
  'trackClick',
  'trackLink',
  'trackForm',
  'pageview',
  'identify',
  'reset',
  'group',
  'track',
  'ready',
  'alias',
  'debug',
  // Dropped by Segment in 5.2.0, kept because `getAnonymousId` calls it
  'user',
  'page',
  'screen',
  'once',
  'off',
  'on',
  'addSourceMiddleware',
  'addIntegrationMiddleware',
  'setAnonymousId',
  'addDestinationMiddleware',
  'register'
]

// Queued calls of these methods carry the page context of the moment they were made, not the one of the replay
const METHODS_WITH_PAGE_CONTEXT = ['track', 'screen', 'alias', 'group', 'page', 'identify']

const options: AnalyticsSnippetOptions = {}

function getAnalyticsUrl(writeKey: string) {
  return options.analyticsUrl || `https://cdn.segment.com/analytics.js/v1/${writeKey}/analytics.min.js`
}

function getOrigin(url: string) {
  try {
    return new URL(url, window.location.href).origin
  } catch (_error) {
    console.warn(`Analytics: could not resolve the origin of the analytics url "${url}"`)
    return undefined
  }
}

/**
 * Points the snippet at a different analytics.js bundle. Takes effect on the next `analytics.load` call, so it must
 * run before the analytics middleware is created.
 */
export function configureAnalyticsSnippet(newOptions: AnalyticsSnippetOptions = {}) {
  if (typeof window === 'undefined') return

  options.analyticsUrl = newOptions.analyticsUrl
  options.cdnUrl = newOptions.cdnUrl || (newOptions.analyticsUrl ? getOrigin(newOptions.analyticsUrl) : undefined)

  const analytics = (window as unknown as { analytics?: SegmentSnippet }).analytics

  // analytics.js resolves the settings endpoint from here, it can't infer it from a proxied bundle path
  if (analytics) {
    if (options.cdnUrl) {
      analytics._cdn = options.cdnUrl
    } else {
      // Reconfiguring back to Segment's CDN, leaving the previous one would resolve the settings from a stale origin
      delete analytics._cdn
    }
  }
}

/**
 * Installs Segment's snippet, which queues every call made before analytics.js is loaded and replays them once it is.
 */
export function installAnalyticsSnippet() {
  if (typeof window === 'undefined') return

  const anyWindow = window as unknown as { analytics?: SegmentSnippet }

  // If the real analytics.js is already on the page return.
  if (anyWindow.analytics?.initialize) return

  // If the snippet was invoked already show an error.
  if (anyWindow.analytics?.invoked) {
    if (window.console && console.error) {
      console.error('Segment snippet included twice.')
    }
    return
  }

  const analytics = (anyWindow.analytics || []) as SegmentSnippet

  analytics.invoked = true
  analytics.methods = METHODS
  analytics.factory = (method: string) => {
    return (...args: unknown[]): unknown => {
      // Once analytics.js is loaded the global is the real one, so calls kept from the snippet are forwarded to it,
      // keeping it as the receiver because its methods rely on the analytics instance as `this`
      const loadedAnalytics = anyWindow.analytics
      if (loadedAnalytics?.initialized) {
        const initializedMethod = loadedAnalytics[method] as (...args: unknown[]) => unknown
        return initializedMethod.apply(loadedAnalytics, args)
      }

      if (METHODS_WITH_PAGE_CONTEXT.includes(method)) {
        const canonical = document.querySelector("link[rel='canonical']")
        args.push({
          __t: 'bpc',
          c: canonical?.getAttribute('href') || undefined,
          p: window.location.pathname,
          u: window.location.href,
          s: window.location.search,
          t: document.title,
          r: document.referrer
        })
      }

      analytics.push([method, ...args])
      return analytics
    }
  }

  for (const method of METHODS) {
    analytics[method] = analytics.factory(method)
  }

  analytics.load = (writeKey: string, loadOptions?: unknown) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.setAttribute('data-global-segment-analytics-key', GLOBAL_ANALYTICS_KEY)
    script.src = getAnalyticsUrl(writeKey)

    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }

    analytics._writeKey = writeKey
    analytics._loadOptions = loadOptions
  }

  if (options.cdnUrl) {
    analytics._cdn = options.cdnUrl
  }
  analytics.SNIPPET_VERSION = SNIPPET_VERSION

  anyWindow.analytics = analytics
}

installAnalyticsSnippet()
