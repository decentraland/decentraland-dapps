import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import {
  manaFiatGatewayPurchaseCompletedFailure,
  setWidgetUrl
} from './actions'
import {
  INITIAL_STATE,
  manaFiatGatewayReducer,
  ManaFiatGatewayState
} from './reducer'

describe('when reducing the action SET_WIDGET_URL', () => {
  it("should set the widget url in the states' data", () => {
    const state: ManaFiatGatewayState = INITIAL_STATE
    const widgetUrl = 'https://url.example.xyz'
    expect(manaFiatGatewayReducer(state, setWidgetUrl(widgetUrl))).toEqual({
      ...state,
      data: { widgetUrl }
    })
  })
})

describe('when reducing the action MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE', () => {
  it("should set the error in the states' data", () => {
    const state: ManaFiatGatewayState = INITIAL_STATE
    const network = Network.ETHEREUM
    const gateway = NetworkGatewayType.MOON_PAY
    const transactionId = 'aTransactionId'
    const error = 'anError'
    expect(
      manaFiatGatewayReducer(
        state,
        manaFiatGatewayPurchaseCompletedFailure(
          network,
          gateway,
          transactionId,
          error
        )
      )
    ).toEqual({
      ...state,
      data: null,
      error
    })
  })
})
