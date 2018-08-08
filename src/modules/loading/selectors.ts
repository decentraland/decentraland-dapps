import { AnyAction } from 'redux'
import { LoadingState } from './reducer'

export const isLoading: (state: LoadingState) => boolean = state =>
  state.length > 0

export const isLoadingType: (state: LoadingState, type: string) => boolean = (
  state,
  type
) => state.some((action: AnyAction) => action.type === type)
