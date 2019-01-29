import {
  OPEN_MODAL,
  CLOSE_MODAL,
  OpenModalAction,
  CloseModalAction
} from './actions'
import { Modal } from './types'

export type ModalState = Record<string, Modal>

const INITIAL_STATE: ModalState = {}

export type ModalReducerAction = OpenModalAction | CloseModalAction

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
          metadata
        }
      }
    }
    case CLOSE_MODAL: {
      const { name } = action.payload

      if (name) {
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
      } else {
        // Close everything
        return INITIAL_STATE
      }
    }
    default:
      return state
  }
}
