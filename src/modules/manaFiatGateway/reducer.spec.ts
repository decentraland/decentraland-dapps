import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import {
  closeManaFiatFeedbackModalRequest,
  manaFiatGatewayPurchaseCompletedFailure,
  openManaFiatFeedbackModalRequest,
  openManaFiatGatewayFailure,
  openManaFiatGatewayRequest,
  openManaFiatGatewaySuccess
} from './actions'
import {
  INITIAL_STATE,
  manaFiatGatewayReducer,
  ManaFiatGatewayState
} from './reducer'

describe('when handling the open mana fiat gateway modal request', () => {
  it('should set error to null and add the action to the loading state', () => {
    const action = openManaFiatGatewayRequest(
      Network.ETHEREUM,
      NetworkGatewayType.MOON_PAY
    )

    const state = manaFiatGatewayReducer(
      { data: {}, loading: [], error: 'error' },
      action
    )

    expect(state).toEqual({ data: {}, loading: [action], error: null })
  })
})

describe('when handling the open mana fiat gateway modal success', () => {
  it('should remove the request action from the loading state and remove the error', () => {
    const requestAction = openManaFiatGatewayRequest(
      Network.ETHEREUM,
      NetworkGatewayType.MOON_PAY
    )
    const successAction = openManaFiatGatewaySuccess()

    const state = manaFiatGatewayReducer(
      { data: {}, loading: [requestAction], error: null },
      successAction
    )

    expect(state).toEqual({ data: {}, loading: [], error: null })
  })
})

describe('when handling the open mana fiat gateway modal failure', () => {
  it('should update the error and remove the request action from the loading state', () => {
    const requestAction = openManaFiatGatewayRequest(
      Network.ETHEREUM,
      NetworkGatewayType.MOON_PAY
    )
    const error = 'error'
    const failureAction = openManaFiatGatewayFailure(
      Network.ETHEREUM,
      NetworkGatewayType.MOON_PAY,
      error
    )

    const state = manaFiatGatewayReducer(
      { data: {}, loading: [requestAction], error: null },
      failureAction
    )

    expect(state).toEqual({ data: {}, loading: [], error })
  })
})

describe('when the failure on purchase completion', () => {
  it('should set the error in the state', () => {
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
      error
    })
  })
})

describe('when handling the opening of the feedback modal', () => {
  it("should set the showFeedback flag as true in the states' data", () => {
    const state: ManaFiatGatewayState = INITIAL_STATE
    const gateway = NetworkGatewayType.MOON_PAY
    expect(
      manaFiatGatewayReducer(state, openManaFiatFeedbackModalRequest(gateway))
    ).toEqual({
      ...state,
      data: {
        ...state.data,
        showFeedback: true
      }
    })
  })
})

describe('when handling the closing of the feedback modal', () => {
  it("should set the showFeedback flag as false in the states' data", () => {
    const state: ManaFiatGatewayState = INITIAL_STATE
    expect(
      manaFiatGatewayReducer(state, closeManaFiatFeedbackModalRequest())
    ).toEqual({
      ...state,
      data: {
        ...state.data,
        showFeedback: false
      }
    })
  })
})
