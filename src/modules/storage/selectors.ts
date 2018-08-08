import { StorageState } from './reducer'

export const getState: (state: any) => StorageState = state => state.storage

export const isLoading: (state: any) => StorageState['loading'] = state =>
  getState(state).loading
