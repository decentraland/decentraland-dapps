import {
  OPEN_MODAL,
  CLOSE_MODAL,
  CLOSE_ALL_MODALS,
  OpenModalAction,
  CloseModalAction,
  CloseAllModalsAction
} from './actions'
import { Modal } from './types'

export type ModalState = Record<string, Modal>

const INITIAL_STATE: ModalState = {}

export type ModalReducerAction =
  | OpenModalAction
  | CloseModalAction
  | CloseAllModalsAction

export function modalReducer(
  state = INITIAL_STATE,
  action: ModalReducerAction
) {
  switch (action.type) {
    case OPEN_MODAL: {
      const { name, metadata } = action.payload

      return {
        ...state,
        [name]: {
          open: true,
          name,
          metadata
        }
      }
    }
    case CLOSE_MODAL: {
      const { name } = action.payload

      if (state[name]) {
        return {
          ...state,
          [name]: {
            ...state[name],
            open: false
          }
        }
      } else {
        // Invalid modal name
        return state
      }
    }
    case CLOSE_ALL_MODALS: {
      const newState = {}
      for (const name in state) {
        newState[name] = { ...state[name], open: false }
      }
      return newState
    }
    default:
      return state
  }
}
