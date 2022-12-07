import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { MoonPayTransactionStatus } from '../manaFiatGateway/moonpay/types'
import {
  manaFiatGatewayPurchaseCompleted,
  manaFiatGatewayPurchaseCompletedFailure,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE,
  openManaFiatGateway,
  OPEN_MANA_FIAT_GATEWAY
} from './actions'

describe('when creating the action to open the MANA-FIAT modal', () => {
  it('should return an object representing the action', () => {
    expect(
      openManaFiatGateway(Network.ETHEREUM, NetworkGatewayType.TRANSAK)
    ).toEqual({
      meta: undefined,
      payload: {
        network: Network.ETHEREUM,
        gateway: NetworkGatewayType.TRANSAK
      },
      type: OPEN_MANA_FIAT_GATEWAY
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
