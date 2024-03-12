import '@testing-library/jest-dom'
import flatten from 'flat'
import nock from 'nock'
import { TextEncoder, TextDecoder } from 'util'
import fetch, { Request, Response } from 'node-fetch'
import en from '../modules/translation/defaults/en.json'
import { setCurrentLocale } from '../modules/translation/utils'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

setCurrentLocale('en', flatten(en))

nock.disableNetConnect()

if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.fetch = fetch as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.Request = Request as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.Response = Response as any
}
