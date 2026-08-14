import { configureAnalyticsSnippet, installAnalyticsSnippet } from './snippet'

const ANALYTICS_URL = 'https://analytics.example.com/aPath/aBundle.min.js'
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

  describe('when a call is made after analytics.js is loaded', () => {
    it('should forward it to the loaded analytics', () => {
      const snippet = anyWindow.analytics
      const track = jest.fn()
      anyWindow.analytics = { initialized: true, track }

      snippet.track('Some Event')

      expect(track).toHaveBeenCalledWith('Some Event')
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
})
