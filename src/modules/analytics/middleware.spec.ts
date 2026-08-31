import { createAnalyticsMiddleware } from './middleware'
import { installAnalyticsSnippet } from './snippet'
import { resetMiddlewareRegistration } from './utils'

const ANALYTICS_URL = 'https://analytics.example.com/aPath/aBundle.min.js'
const API_HOST = 'api.example.com/v1'
const API_KEY = 'anApiKey'

const anyWindow = window as unknown as { analytics: any }

describe('when creating the analytics middleware', () => {
  beforeEach(() => {
    delete (window as any).analytics
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    resetMiddlewareRegistration()
    installAnalyticsSnippet()
  })

  describe('and no options are given', () => {
    it('should load analytics.js without options, so the events keep going to segment ingestion', () => {
      createAnalyticsMiddleware(API_KEY)

      expect(anyWindow.analytics._writeKey).toBe(API_KEY)
      expect(anyWindow.analytics._loadOptions).toBeUndefined()
    })
  })

  describe('and an api host is given', () => {
    it('should load analytics.js delivering the events to it', () => {
      createAnalyticsMiddleware(API_KEY, { analyticsUrl: ANALYTICS_URL, apiHost: API_HOST })

      expect(anyWindow.analytics._loadOptions).toEqual({ integrations: { 'Segment.io': { apiHost: API_HOST } } })
    })
  })

  describe('and analytics.js is already loaded on the page, so the snippet is not the one loading it', () => {
    let load: jest.Mock

    beforeEach(() => {
      load = jest.fn()
      anyWindow.analytics = {
        initialize: true,
        load,
        addSourceMiddleware: jest.fn()
      }
    })

    describe('and an api host is given', () => {
      it('should pass it to load as the integrations settings of the segment destination', () => {
        createAnalyticsMiddleware(API_KEY, { apiHost: API_HOST })

        expect(load).toHaveBeenCalledWith(API_KEY, { integrations: { 'Segment.io': { apiHost: API_HOST } } })
      })
    })

    describe('and no options are given', () => {
      it('should pass no load options', () => {
        createAnalyticsMiddleware(API_KEY)

        expect(load).toHaveBeenCalledWith(API_KEY, undefined)
      })
    })
  })
})
