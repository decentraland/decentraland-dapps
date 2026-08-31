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
  /**
   * Host the events are delivered to, without a protocol (`host/basePath`). Defaults to Segment's ingestion endpoint,
   * which ad blockers drop just like its CDN, so dapps can point it at a first party proxy instead. Example:
   * `api.example.com/v1`.
   *
   * analytics.js prepends the protocol and appends the method path (`/t`, `/i`, `/p`), it takes neither of them here.
   */
  apiHost?: string
}

type SegmentIntegrationSettings = boolean | Record<string, unknown>

export type AnalyticsLoadOptions = {
  integrations?: Record<string, SegmentIntegrationSettings>
  [key: string]: unknown
}

type SegmentSnippet = any[] & Record<string, any>

const GLOBAL_ANALYTICS_KEY = 'analytics'
const SNIPPET_VERSION = '5.2.0'
// Name of the analytics.js integration that delivers the events to Segment, the one carrying the ingestion host
const SEGMENT_IO = 'Segment.io'
const PROTOCOL_PREFIX = /^[a-z][a-z0-9+.-]*:\/\//i
const TRAILING_SLASHES = /\/+$/

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
  return options.analyticsUrl || `https://cdn.segment.com/analytics.js/v1/${encodeURIComponent(writeKey)}/analytics.min.js`
}

/**
 * These urls end up loading a script and fetching the settings that decide which integrations run, so a value that is
 * not a valid https url, or one of the dapp's own, is dropped instead of trusted.
 */
function resolveUrl(name: string, url: string) {
  let resolved: URL

  try {
    resolved = new URL(url, window.location.href)
  } catch (_error) {
    console.warn(`Analytics: ignoring the ${name} "${url}", it is not a valid url`)
    return undefined
  }

  if (resolved.protocol !== 'https:' && resolved.origin !== window.location.origin) {
    console.warn(`Analytics: ignoring the ${name} "${url}", it is not served over https`)
    return undefined
  }

  return resolved
}

/**
 * Normalizes the host the events are delivered to. analytics.js takes it without a protocol (`host/basePath`) and
 * prepends one, so a value that carries it is accepted and stripped instead of producing `https://https://host`.
 */
function resolveApiHost(apiHost: string) {
  const resolved = resolveUrl('api host', PROTOCOL_PREFIX.test(apiHost) ? apiHost : `https://${apiHost}`)

  return resolved && `${resolved.host}${resolved.pathname}`.replace(TRAILING_SLASHES, '')
}

/**
 * Merges the configured first party ingestion host into the given load options, keeping the rest of them and the other
 * integrations untouched, and returns them as they came when there is none so Segment's own ingestion stays in place.
 * Exported for dapps that call `analytics.load` themselves instead of going through the analytics middleware.
 */
export function getAnalyticsLoadOptions(loadOptions?: AnalyticsLoadOptions): AnalyticsLoadOptions | undefined {
  if (!options.apiHost) return loadOptions

  const segmentIo = loadOptions?.integrations?.[SEGMENT_IO]

  return {
    ...loadOptions,
    integrations: {
      ...loadOptions?.integrations,
      [SEGMENT_IO]: {
        ...(typeof segmentIo === 'object' ? segmentIo : undefined),
        apiHost: options.apiHost
      }
    }
  }
}

/**
 * Points the snippet at a different analytics.js bundle. Takes effect on the next `analytics.load` call, so it must
 * run before the analytics middleware is created.
 */
export function configureAnalyticsSnippet(newOptions: AnalyticsSnippetOptions = {}) {
  if (typeof window === 'undefined') return

  const analyticsUrl = newOptions.analyticsUrl ? resolveUrl('analytics url', newOptions.analyticsUrl) : undefined
  const cdnUrl = newOptions.cdnUrl ? resolveUrl('cdn url', newOptions.cdnUrl) : undefined

  options.analyticsUrl = analyticsUrl?.href
  options.cdnUrl = cdnUrl ? newOptions.cdnUrl : analyticsUrl?.origin
  options.apiHost = newOptions.apiHost ? resolveApiHost(newOptions.apiHost) : undefined

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

  analytics.load = (writeKey: string, loadOptions?: AnalyticsLoadOptions) => {
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
    // analytics.js reads the ingestion host from here once the bundle it just injected boots
    analytics._loadOptions = getAnalyticsLoadOptions(loadOptions)
  }

  if (options.cdnUrl) {
    analytics._cdn = options.cdnUrl
  }
  analytics.SNIPPET_VERSION = SNIPPET_VERSION

  anyWindow.analytics = analytics
}

installAnalyticsSnippet()
