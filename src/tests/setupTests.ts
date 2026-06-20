import '@testing-library/jest-dom'
import flatten from 'flat'
import nock from 'nock'
import en from '../modules/translation/defaults/en.json'
import { setCurrentLocale } from '../modules/translation/utils'

setCurrentLocale('en', flatten(en))

// `fetch`, `Request`, `Response`, `TextEncoder` and the other web globals are
// provided to the jsdom global by the custom test environment
// (jsdomNativeFetchEnvironment.cjs) using Node's native implementations, so no
// node-fetch polyfill is needed here.
nock.disableNetConnect()
