import { TranslationState } from './reducer'
import { Locale } from 'decentraland-ui/dist/components/Language/Language'

export const getState: (state: any) => TranslationState = state =>
  state.translation
export const getData: (state: any) => TranslationState['data'] = state =>
  getState(state).data
export const getLoading: (state: any) => TranslationState['loading'] = state =>
  getState(state).loading
export const isLoading: (state: any) => boolean = state =>
  getLoading(state).length > 0

export const getLocale: (state: any) => Locale = state => getState(state).locale

export const isEnabled: (state: any) => boolean = state => !!getState(state)
