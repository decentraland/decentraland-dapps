import { ProfileState } from './reducer'

export const getState: (state: any) => ProfileState = state => state.profile

export const getData: (state: any) => ProfileState['data'] = state =>
  getState(state).data

export const getError: (state: any) => ProfileState['error'] = state =>
  getState(state).error

export const getLoading = (state: any) => getState(state).loading
