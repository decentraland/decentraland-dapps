import { action } from 'typesafe-actions'
import { NAVIGATE_TO } from './types'

export const navigateTo = (url: string) => action(NAVIGATE_TO, { url })
