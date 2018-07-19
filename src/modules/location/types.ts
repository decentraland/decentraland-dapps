import { ActionType } from 'typesafe-actions'
import * as actions from './actions'

export const NAVIGATE_TO = 'Navigate to URL'

// Interface and type definitions

export type NavigateTo = ReturnType<typeof actions.navigateTo>

export type LocationActions = ActionType<typeof actions>
