import {
  RENDER_TOAST,
  HIDE_TOAST,
  RenderToastAction,
  HideToastAction,
  HIDE_ALL_TOASTS,
  HideAllToastsAction
} from './actions'

export type ToastState = number[] // we only store ids here, check cache.ts for the entire data

const INITIAL_STATE: ToastState = []

export type ToastReducerAction =
  | RenderToastAction
  | HideToastAction
  | HideAllToastsAction

export function toastReducer(
  state = INITIAL_STATE,
  action: ToastReducerAction
): ToastState {
  switch (action.type) {
    case RENDER_TOAST: {
      const { id } = action.payload
      return [...state, id]
    }
    case HIDE_TOAST: {
      const { id } = action.payload
      return state.filter(stateId => stateId !== id)
    }
    case HIDE_ALL_TOASTS: {
      return []
    }
    default:
      return state
  }
}
