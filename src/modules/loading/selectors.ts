import { AnyAction } from 'redux'

export const isLoading: (state: AnyAction[]) => boolean = state =>
  state.length > 0

export const isLoadingType: (state: AnyAction[], type: string) => boolean = (
  state,
  type
) => state.some((action: AnyAction) => action.type === type)
