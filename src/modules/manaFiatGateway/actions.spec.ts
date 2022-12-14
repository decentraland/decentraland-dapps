import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { MoonPayTransactionStatus } from '../manaFiatGateway/moonpay/types'
import {
  closeManaFiatFeedbackModalRequest,
  CLOSE_MANA_FIAT_FEEDBACK_MODAL_REQUEST,
  manaFiatGatewayPurchaseCompleted,
  manaFiatGatewayPurchaseCompletedFailure,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE,
  openManaFiatFeedbackModalRequest,
  openManaFiatGatewayFailure,
  openManaFiatGatewayRequest,
  openManaFiatGatewaySuccess,
  OPEN_MANA_FIAT_FEEDBACK_MODAL_REQUEST,
  OPEN_MANA_FIAT_GATEWAY_FAILURE,
  OPEN_MANA_FIAT_GATEWAY_REQUEST,
  OPEN_MANA_FIAT_GATEWAY_SUCCESS
} from './actions'

describe('when creating the action that signals the start of a mana fiat gateway modal opening', () => {
  it('should return an object representing the action', () => {
    expect(
      openManaFiatGatewayRequest(Network.ETHEREUM, NetworkGatewayType.TRANSAK)
    ).toEqual({
      meta: undefined,
      payload: {
        network: Network.ETHEREUM,
        gateway: NetworkGatewayType.TRANSAK
      },
      type: OPEN_MANA_FIAT_GATEWAY_REQUEST
    })
  })
})

describe('when creating the action that signals the successful opening of the mana fiat gateway modal', () => {
  it('should return an action signaling the success of the mana fiat gateway modal opening', () => {
    expect(openManaFiatGatewaySuccess()).toEqual({
      meta: undefined,
      type: OPEN_MANA_FIAT_GATEWAY_SUCCESS
    })
  })
})

describe('when creating the action that signals the unsuccessful opening of the mana fiat gateway modal', () => {
  it('should return an action signaling the unsuccess of the mana fiat gateway modal opening', () => {
    const defaultError = 'Default error'
    expect(
      openManaFiatGatewayFailure(
        Network.ETHEREUM,
        NetworkGatewayType.MOON_PAY,
        defaultError
      )
    ).toEqual({
      meta: undefined,
      payload: {
        network: Network.ETHEREUM,
        gateway: NetworkGatewayType.MOON_PAY,
        error: defaultError
      },
      type: OPEN_MANA_FIAT_GATEWAY_FAILURE
    })
  })
})

describe('when creating the action to signal a completed purchase', () => {
  it('should return an object representing the action', () => {
    const network = Network.ETHEREUM,
      gateway = NetworkGatewayType.MOON_PAY,
      transactionId = 'transcation-id',
      status = MoonPayTransactionStatus.PENDING
    expect(
      manaFiatGatewayPurchaseCompleted(network, gateway, transactionId, status)
    ).toEqual({
      meta: undefined,
      payload: {
        network,
        gateway,
        transactionId,
        status
      },
      type: MANA_FIAT_GATEWAY_PURCHASE_COMPLETED
    })
  })
})

describe('when creating the action to signal a failure after a purchase was completed', () => {
  it('should return an object representing the action', () => {
    const network = Network.ETHEREUM,
      gateway = NetworkGatewayType.MOON_PAY,
      transactionId = 'transcation-id',
      error = 'some error'
    expect(
      manaFiatGatewayPurchaseCompletedFailure(
        network,
        gateway,
        transactionId,
        error
      )
    ).toEqual({
      meta: undefined,
      payload: {
        network,
        gateway,
        transactionId,
        error
      },
      type: MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE
    })
  })
})

describe('when creating the action that signals the opening of the feedback modal', () => {
  it('should return an object representing the action', () => {
    const gateway = NetworkGatewayType.MOON_PAY
    expect(openManaFiatFeedbackModalRequest(gateway)).toEqual({
      meta: undefined,
      payload: { gateway },
      type: OPEN_MANA_FIAT_FEEDBACK_MODAL_REQUEST
    })
  })
})

describe('when creating the action that signals the closing of the feedback modal', () => {
  it('should return an object representing the action', () => {
    expect(closeManaFiatFeedbackModalRequest()).toEqual({
      meta: undefined,
      payload: undefined,
      type: CLOSE_MANA_FIAT_FEEDBACK_MODAL_REQUEST
    })
  })
})
