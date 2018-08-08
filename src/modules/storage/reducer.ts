import { AnyAction, Reducer } from 'redux'
import * as storage from 'redux-storage'
import { STORAGE_LOAD } from './actions'

export type StorageState = {
  loading: boolean
}

export const INITIAL_STATE: StorageState = {
  loading: true
}

export function storageReducerWrapper(
  reducer: any,
  merger?: storage.StateMerger
): Reducer<{} | undefined> {
  return storage.reducer(reducer, merger)
}

export function storageReducer(state = INITIAL_STATE, action: AnyAction) {
  switch (action.type) {
    case STORAGE_LOAD:
      return {
        loading: false
      }
    default:
      return state
  }
}
