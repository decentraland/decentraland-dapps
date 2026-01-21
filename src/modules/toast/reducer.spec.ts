import { hideAllToasts } from './actions'
import { toastReducer, ToastState } from './reducer'

describe('when reducing the action HIDE_ALL_TOASTS', () => {
  it('should emty the toasts array', () => {
    const state: ToastState = [0, 1]
    expect(toastReducer(state, hideAllToasts())).toEqual([])
  })
})
