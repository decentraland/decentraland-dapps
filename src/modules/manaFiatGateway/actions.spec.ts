import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { MoonPayTransactionStatus } from '../manaFiatGateway/moonpay/types'
import {
  manaFiatGatewayPurchaseCompleted,
  manaFiatGatewayPurchaseCompletedFailure,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE,
  openBuyManaWithFiatModalFailure,
  openBuyManaWithFiatModalRequest,
  openBuyManaWithFiatModalSuccess,
  openManaFiatGatewayFailure,
  openManaFiatGatewayRequest,
  openManaFiatGatewaySuccess,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS,
  OPEN_MANA_FIAT_GATEWAY_FAILURE,
  OPEN_MANA_FIAT_GATEWAY_REQUEST,
  OPEN_MANA_FIAT_GATEWAY_SUCCESS
} from './actions'

describe('when creating the action that signals the start of a buy mana with fiat modal opening', () => {
  describe('when not passing the selected network', () => {
    it('should return an object representing the action', () => {
      expect(openBuyManaWithFiatModalRequest()).toEqual({
        meta: undefined,
        payload: {},
        type: OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST
      })
    })
  })

  describe('when passing the selected network', () => {
    it('should return an object representing the action', () => {
      const selectedNetwork = Network.ETHEREUM
      expect(openBuyManaWithFiatModalRequest(selectedNetwork)).toEqual({
        meta: undefined,
        payload: {
          selectedNetwork
        },
        type: OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST
      })
    })
  })
})

describe('when creating the action that signals the successful opening of the buy mana with fiat modal', () => {
  it('should return an action signaling the success of the buy mana with fiat modal opening', () => {
    expect(openBuyManaWithFiatModalSuccess()).toEqual({
      meta: undefined,
      type: OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS
    })
  })
})

describe('when creating the action that signals the unsuccessful opening of the buy mana with fiat modal', () => {
  it('should return an action signaling the unsuccess of the buy mana with fiat modal opening', () => {
    const defaultError = 'Default error'
    expect(openBuyManaWithFiatModalFailure(defaultError)).toEqual({
      meta: undefined,
      payload: {
        error: defaultError
      },
      type: OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE
    })
  })
})

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