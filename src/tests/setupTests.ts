import en from '../modules/translation/defaults/en.json'
import flatten from 'flat'
import { TextEncoder, TextDecoder } from 'util'
import { setCurrentLocale } from '../modules/translation/utils'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

setCurrentLocale('en', flatten(en))
