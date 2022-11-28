import { setWidgetUrl } from './actions'
import {
  INITIAL_STATE,
  manaFiatGatewayReducer,
  ManaFiatGatewayState
} from './reducer'

describe('when reducing the action HIDE_ALL_TOASTS', () => {
  it('should emty the toasts array', () => {
    const state: ManaFiatGatewayState = INITIAL_STATE
    const widgetUrl = 'https://url.example.xyz'
    expect(manaFiatGatewayReducer(state, setWidgetUrl(widgetUrl))).toEqual({
      ...state,
      data: { widgetUrl }
    })
  })
})
