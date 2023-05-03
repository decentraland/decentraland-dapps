import flatten from 'flat'
import nock from 'nock'
import { TextEncoder, TextDecoder } from 'util'
import en from '../modules/translation/defaults/en.json'
import { setCurrentLocale } from '../modules/translation/utils'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

setCurrentLocale('en', flatten(en))

nock.disableNetConnect()
