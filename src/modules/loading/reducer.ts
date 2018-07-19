import { LoadingActions } from './types'
import { removeLast, getType, getStatus } from './utils'
import { AnyAction } from 'redux'

export const INITIAL_STATE: AnyAction[] = []

export function loadingReducer(
  state: AnyAction[] = INITIAL_STATE,
  action: LoadingActions
): AnyAction[] {
  const type = getType(action) // ie. "Fetch Address Parcels"
  const status = getStatus(action) // REQUEST, SUCCESS, FAILURE

  switch (status) {
    case 'REQUEST': {
      return [...state, action]
    }
    case 'FAILURE':
    case 'SUCCESS': {
      return removeLast(state, actionItem => getType(actionItem) === type)
    }
    default:
      return state
  }
}
