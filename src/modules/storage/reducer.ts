import { AnyAction, Reducer } from 'redux'
import * as storage from 'redux-storage'
import { STORAGE_LOAD, StorageState } from './types'

export const INITIAL_STATE: StorageState = {
  loading: true
}

export function storageReducerWrapper(
  reducer: any,
  merger?: storage.StateMerger
): Reducer<{}> {
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
