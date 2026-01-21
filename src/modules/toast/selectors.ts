import * as cache from './cache'
import { ToastState } from './reducer'
import { Toast } from './types'

export const getState: (state: any) => ToastState = state => state.toast

export const getToasts: (state: any) => Toast[] = state => getState(state).map(cache.get)
