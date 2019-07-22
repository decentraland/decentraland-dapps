import { AnyAction, Reducer } from 'redux'
import * as storage from 'redux-persistence'
import { StateMerger } from 'redux-persistence/dist/types'
import { STORAGE_LOAD } from './actions'

export type StorageState = {
  version: number
  loading: boolean
}

export const INITIAL_STATE: StorageState = {
  version: 1,
  loading: true
}

export function storageReducerWrapper(
  reducer: any,
  merger?: StateMerger
): Reducer<{} | undefined> {
  return storage.reducer(reducer, merger)
}

export function storageReducer(state = INITIAL_STATE, action: AnyAction) {
  switch (action.type) {
    case STORAGE_LOAD:
      return {
        ...state,
        loading: false
      }
    default:
      return state
  }
}
