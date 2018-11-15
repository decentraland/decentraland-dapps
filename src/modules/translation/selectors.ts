import { TranslationState } from './reducer'

export const getState: (state: any) => TranslationState = state =>
  state.translation
export const getData: (state: any) => TranslationState['data'] = state =>
  getState(state).data
export const getLoading: (state: any) => TranslationState['loading'] = state =>
  getState(state).loading
export const isLoading: (state: any) => boolean = state =>
  getLoading(state).length > 0

export const isEnabled: (state: any) => boolean = state => !!getState(state)
