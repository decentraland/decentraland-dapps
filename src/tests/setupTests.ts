import en from '../modules/translation/defaults/en.json'
import flatten from 'flat'
import { setCurrentLocale } from '../modules/translation/utils'

setCurrentLocale('en', flatten(en))
