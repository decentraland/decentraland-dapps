import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { setPurchase, unsetPurchase } from '../mana/actions'
import { Purchase, PurchaseStatus } from '../mana/types'
import {
  manaFiatGatewayPurchaseCompletedFailure,
  openBuyManaWithFiatModalFailure,
  openBuyManaWithFiatModalRequest,
  openBuyManaWithFiatModalSuccess,
  openManaFiatGatewayFailure,
  openManaFiatGatewayRequest,
  openManaFiatGatewaySuccess
} from './actions'
import {
  INITIAL_STATE,
  manaFiatGatewayReducer,
  ManaFiatGatewayState
} from './reducer'

describe('when handling the open buy mana with fiat modal request', () => {
  describe('when opening the modal without a selected network', () => {
    it('should set error to null and add the action to the loading state', () => {
      const action = openBuyManaWithFiatModalRequest()

      const state = manaFiatGatewayReducer(
        { data: { purchases: [] }, loading: [], error: 'error' },
        action
      )

      expect(state).toEqual({
        data: { purchases: [] },
        loading: [action],
        error: null
      })
    })
  })

  describe('when opening the modal with an already selected network', () => {
    it('should set error to null and add the action to the loading state', () => {
      const action = openBuyManaWithFiatModalRequest(Network.ETHEREUM)

      const state = manaFiatGatewayReducer(
        { data: { purchases: [] }, loading: [], error: 'error' },
        action
      )

      expect(state).toEqual({
        data: { purchases: [] },
        loading: [action],
        error: null
      })
    })
  })
})

describe('when handling the open buy mana with fiat modal success', () => {
  it('should remove the request action from the loading state and remove the error', () => {
    const requestAction = openBuyManaWithFiatModalRequest()
    const successAction = openBuyManaWithFiatModalSuccess()

    const state = manaFiatGatewayReducer(
      { data: { purchases: [] }, loading: [requestAction], error: null },
      successAction
    )

    expect(state).toEqual({ data: { purchases: [] }, loading: [], error: null })
  })
})

describe('when handling the open buy mana with fiat modal failure', () => {
  it('should update the error and remove the request action from the loading state', () => {
    const requestAction = openBuyManaWithFiatModalRequest()
    const error = 'error'
    const failureAction = openBuyManaWithFiatModalFailure(error)

    const state = manaFiatGatewayReducer(
      { data: { purchases: [] }, loading: [requestAction], error: null },
      failureAction
    )

    expect(state).toEqual({ data: { purchases: [] }, loading: [], error })
  })
})

describe('when handling the open mana fiat gateway modal request', () => {
  it('should set error to null and add the action to the loading state', () => {
    const action = openManaFiatGatewayRequest(
      Network.ETHEREUM,
      NetworkGatewayType.MOON_PAY
    )

    const state = manaFiatGatewayReducer(
      { data: { purchases: [] }, loading: [], error: 'error' },
      action
    )

    expect(state).toEqual({
      data: { purchases: [] },
      loading: [action],
      error: null
    })
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
      { data: { purchases: [] }, loading: [requestAction], error: null },
      successAction
    )

    expect(state).toEqual({ data: { purchases: [] }, loading: [], error: null })
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
      { data: { purchases: [] }, loading: [requestAction], error: null },
      failureAction
    )

    expect(state).toEqual({ data: { purchases: [] }, loading: [], error })
  })
})

describe('when handling the failure on purchase completion', () => {
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

describe('when handling the set purchase', () => {
  const mockPurchase: Purchase = {
    address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
    amount: 100,
    id: 'mock-id',
    network: Network.ETHEREUM,
    timestamp: 1535398843748,
    status: PurchaseStatus.PENDING,
    gateway: NetworkGatewayType.MOON_PAY
  }
  const state: ManaFiatGatewayState = INITIAL_STATE

  describe('when the purchase does not yet exist', () => {
    it('should add or replace if already exists ', () => {
      expect(manaFiatGatewayReducer(state, setPurchase(mockPurchase))).toEqual({
        ...state,
        data: {
          ...state.data,
          purchases: [...state.data.purchases, mockPurchase]
        }
      })
    })
  })

  describe('when the purchase already exists', () => {
    const stateWithPurchases = {
      ...state,
      data: { ...state.data, purchases: [mockPurchase] }
    }

    it('should add or replace if already exists', () => {
      const completeMockPurchase: Purchase = {
        ...mockPurchase,
        status: PurchaseStatus.COMPLETE
      }
      expect(
        manaFiatGatewayReducer(
          stateWithPurchases,
          setPurchase(completeMockPurchase)
        )
      ).toEqual({
        ...stateWithPurchases,
        data: {
          ...state.data,
          purchases: [...state.data.purchases, completeMockPurchase]
        }
      })
    })
  })
})

describe('when handling the unset purchase', () => {
  const mockPurchase: Purchase = {
    address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
    amount: 100,
    id: 'mock-id',
    network: Network.ETHEREUM,
    timestamp: 1535398843748,
    status: PurchaseStatus.PENDING,
    gateway: NetworkGatewayType.MOON_PAY
  }
  const state: ManaFiatGatewayState = INITIAL_STATE

  describe('when the purchase does not exist', () => {
    it('should leave the purchases as before ', () => {
      expect(
        manaFiatGatewayReducer(state, unsetPurchase(mockPurchase))
      ).toEqual({
        ...state,
        data: {
          ...state.data,
          purchases: state.data.purchases
        }
      })
    })
  })

  describe('when the purchase exists', () => {
    const stateWithPurchases = {
      ...state,
      data: { ...state.data, purchases: [mockPurchase] }
    }

    it('should remove it from the purchases list', () => {
      expect(
        manaFiatGatewayReducer(stateWithPurchases, unsetPurchase(mockPurchase))
      ).toEqual({
        ...stateWithPurchases,
        data: {
          ...state.data,
          purchases: []
        }
      })
    })
  })
})
