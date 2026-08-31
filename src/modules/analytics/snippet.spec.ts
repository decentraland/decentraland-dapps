import { configureAnalyticsSnippet, getAnalyticsLoadOptions, installAnalyticsSnippet } from './snippet'

const ANALYTICS_URL = 'https://analytics.example.com/aPath/aBundle.min.js'
const API_HOST = 'api.example.com/v1'
const WRITE_KEY = 'aWriteKey'

const anyWindow = window as unknown as { analytics: any }

function getInjectedScript() {
  return document.querySelector('script[data-global-segment-analytics-key]')
}

describe('Analytics Snippet', () => {
  beforeEach(() => {
    delete (window as any).analytics
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    configureAnalyticsSnippet()
    installAnalyticsSnippet()
  })

  describe('when a call is made before analytics.js is loaded', () => {
    it('should queue it along the page context it was made in', () => {
      anyWindow.analytics.track('Some Event', { aProperty: 'aValue' })

      expect(anyWindow.analytics[0]).toEqual([
        'track',
        'Some Event',
        { aProperty: 'aValue' },
        expect.objectContaining({
          __t: 'bpc',
          p: window.location.pathname,
          u: window.location.href
        })
      ])
    })
  })

  describe('when the methods this package calls are stubbed', () => {
    it('should stub user, which getAnonymousId relies on', () => {
      expect(typeof anyWindow.analytics.user).toBe('function')
    })
  })

  describe('when a call is made after analytics.js is loaded', () => {
    let snippet: any
    let loadedAnalytics: any
    let track: jest.Mock

    beforeEach(() => {
      snippet = anyWindow.analytics
      track = jest.fn(function (this: unknown) {
        return this
      })
      loadedAnalytics = { initialized: true, track }
      anyWindow.analytics = loadedAnalytics
    })

    it('should forward it to the loaded analytics', () => {
      snippet.track('Some Event')

      expect(track).toHaveBeenCalledWith('Some Event')
    })

    it('should forward it keeping the loaded analytics as the receiver', () => {
      expect(snippet.track('Some Event')).toBe(loadedAnalytics)
    })
  })

  describe('when the snippet is not configured with an analytics url', () => {
    it('should load the bundle from segment cdn', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(getInjectedScript()).toHaveProperty('src', `https://cdn.segment.com/analytics.js/v1/${WRITE_KEY}/analytics.min.js`)
    })

    it('should not set the cdn analytics.js resolves its settings from', () => {
      expect(anyWindow.analytics._cdn).toBeUndefined()
    })
  })

  describe('when the snippet is configured with an analytics url', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ analyticsUrl: ANALYTICS_URL })
    })

    it('should load the bundle from it', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(getInjectedScript()).toHaveProperty('src', ANALYTICS_URL)
    })

    it('should store the write key it was loaded with', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(anyWindow.analytics._writeKey).toBe(WRITE_KEY)
    })

    it('should resolve the settings from its origin', () => {
      expect(anyWindow.analytics._cdn).toBe('https://analytics.example.com')
    })
  })

  describe('when the snippet is reconfigured without an analytics url', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ analyticsUrl: ANALYTICS_URL })
      configureAnalyticsSnippet()
    })

    it('should stop resolving the settings from the previous cdn', () => {
      expect(anyWindow.analytics._cdn).toBeUndefined()
    })

    it('should load the bundle from segment cdn', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(getInjectedScript()).toHaveProperty('src', `https://cdn.segment.com/analytics.js/v1/${WRITE_KEY}/analytics.min.js`)
    })
  })

  describe.each([
    ['malformed', 'http://['],
    ['not served over https', 'http://analytics.example.com/aPath/aBundle.min.js'],
    ['not http', 'data:text/javascript,console.log(1)']
  ])('when the snippet is configured with an analytics url that is %s', (_case, analyticsUrl) => {
    let consoleWarn: jest.SpyInstance

    beforeEach(() => {
      consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
      configureAnalyticsSnippet({ analyticsUrl })
    })

    afterEach(() => {
      consoleWarn.mockRestore()
    })

    it('should warn about it and ignore it', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(consoleWarn).toHaveBeenCalled()
      expect(getInjectedScript()).toHaveProperty('src', `https://cdn.segment.com/analytics.js/v1/${WRITE_KEY}/analytics.min.js`)
      expect(anyWindow.analytics._cdn).toBeUndefined()
    })
  })

  describe('when the snippet is configured with an analytics url of the dapp itself', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ analyticsUrl: '/aPath/aBundle.min.js' })
    })

    it('should load the bundle from it even if the dapp is not served over https', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(getInjectedScript()).toHaveProperty('src', `${window.location.origin}/aPath/aBundle.min.js`)
      expect(anyWindow.analytics._cdn).toBe(window.location.origin)
    })
  })

  describe('when the snippet is configured with a cdn url that is not served over https', () => {
    let consoleWarn: jest.SpyInstance

    beforeEach(() => {
      consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
      configureAnalyticsSnippet({
        analyticsUrl: ANALYTICS_URL,
        cdnUrl: 'http://cdn.example.com'
      })
    })

    afterEach(() => {
      consoleWarn.mockRestore()
    })

    it('should warn about it and fall back to the origin of the analytics url', () => {
      expect(consoleWarn).toHaveBeenCalled()
      expect(anyWindow.analytics._cdn).toBe('https://analytics.example.com')
    })
  })

  describe('when the snippet is configured with an analytics url and a cdn url', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({
        analyticsUrl: ANALYTICS_URL,
        cdnUrl: 'https://cdn.example.com'
      })
    })

    it('should resolve the settings from the cdn url', () => {
      expect(anyWindow.analytics._cdn).toBe('https://cdn.example.com')
    })
  })

  describe('when the snippet is installed twice', () => {
    let consoleError: jest.SpyInstance

    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      installAnalyticsSnippet()
    })

    afterEach(() => {
      consoleError.mockRestore()
    })

    it('should keep the snippet that was already installed and warn about it', () => {
      expect(consoleError).toHaveBeenCalledWith('Segment snippet included twice.')
    })
  })

  describe('when the snippet is not configured with an api host', () => {
    it('should load without options, so the events keep going to segment ingestion', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(anyWindow.analytics._loadOptions).toBeUndefined()
    })

    it('should keep the load options it was called with untouched', () => {
      anyWindow.analytics.load(WRITE_KEY, { integrations: { 'Google Analytics': false } })

      expect(anyWindow.analytics._loadOptions).toEqual({ integrations: { 'Google Analytics': false } })
    })
  })

  describe('when the snippet is configured with an api host', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ apiHost: API_HOST })
    })

    it('should deliver the events to it', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(anyWindow.analytics._loadOptions).toEqual({ integrations: { 'Segment.io': { apiHost: API_HOST } } })
    })

    it('should merge it into the load options it was called with', () => {
      anyWindow.analytics.load(WRITE_KEY, { integrations: { 'Google Analytics': false } })

      expect(anyWindow.analytics._loadOptions).toEqual({
        integrations: { 'Google Analytics': false, 'Segment.io': { apiHost: API_HOST } }
      })
    })
  })

  describe('when the snippet is configured with an api host and load already carries settings for the segment destination', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ apiHost: API_HOST })
    })

    it('should keep the settings it was called with', () => {
      anyWindow.analytics.load(WRITE_KEY, { integrations: { 'Segment.io': { deliveryStrategy: { strategy: 'batching' } } } })

      expect(anyWindow.analytics._loadOptions).toEqual({
        integrations: { 'Segment.io': { deliveryStrategy: { strategy: 'batching' }, apiHost: API_HOST } }
      })
    })

    it('should replace a boolean toggle rather than spreading it into the settings', () => {
      anyWindow.analytics.load(WRITE_KEY, { integrations: { 'Segment.io': true } })

      expect(anyWindow.analytics._loadOptions).toEqual({ integrations: { 'Segment.io': { apiHost: API_HOST } } })
    })
  })

  describe.each([
    ['carries a protocol', `https://${API_HOST}`],
    ['carries a trailing slash', `${API_HOST}/`]
  ])('when the snippet is configured with an api host that %s', (_case, apiHost) => {
    beforeEach(() => {
      configureAnalyticsSnippet({ apiHost })
    })

    it('should strip it, analytics.js prepends the protocol and appends the method path itself', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(anyWindow.analytics._loadOptions).toEqual({ integrations: { 'Segment.io': { apiHost: API_HOST } } })
    })
  })

  describe.each([
    ['malformed', 'https://['],
    ['not served over https', 'http://api.example.com/v1']
  ])('when the snippet is configured with an api host that is %s', (_case, apiHost) => {
    let consoleWarn: jest.SpyInstance

    beforeEach(() => {
      consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
      configureAnalyticsSnippet({ apiHost })
    })

    afterEach(() => {
      consoleWarn.mockRestore()
    })

    it('should warn about it and leave the events going to segment ingestion', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(consoleWarn).toHaveBeenCalled()
      expect(anyWindow.analytics._loadOptions).toBeUndefined()
    })
  })

  describe('when the snippet is reconfigured without an api host', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ apiHost: API_HOST })
      configureAnalyticsSnippet()
    })

    it('should stop delivering the events to the previous api host', () => {
      anyWindow.analytics.load(WRITE_KEY)

      expect(anyWindow.analytics._loadOptions).toBeUndefined()
    })
  })

  describe('when reading the load options of a snippet configured with an api host', () => {
    beforeEach(() => {
      configureAnalyticsSnippet({ apiHost: API_HOST })
    })

    it('should return the integrations settings analytics.js delivers the events with', () => {
      expect(getAnalyticsLoadOptions()).toEqual({ integrations: { 'Segment.io': { apiHost: API_HOST } } })
    })
  })

  describe('when reading the load options of a snippet configured without an api host', () => {
    it('should return nothing, so a caller passing them along changes no default', () => {
      expect(getAnalyticsLoadOptions()).toBeUndefined()
    })
  })
})
