import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import {
  setPurchase,
  SET_PURCHASE,
  unsetPurchase,
  UNSET_PURCHASE
} from './actions'
import { Purchase, PurchaseStatus } from './types'

describe('when creating the action to set the purchase', () => {
  it('should return an object representing the action', () => {
    const mockPurchase: Purchase = {
      address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
      amount: 100,
      id: '354b1f46-480c-4307-9896-f4c81c1e1e17',
      network: Network.ETHEREUM,
      status: PurchaseStatus.PENDING,
      timestamp: 1535398843748,
      gateway: NetworkGatewayType.MOON_PAY
    }

    expect(setPurchase(mockPurchase)).toEqual({
      meta: undefined,
      payload: {
        purchase: mockPurchase
      },
      type: SET_PURCHASE
    })
  })
})

describe('when creating the action to unset the purchase', () => {
  it('should return an object representing the action', () => {
    const mockPurchase: Purchase = {
      address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
      amount: 100,
      id: '354b1f46-480c-4307-9896-f4c81c1e1e17',
      network: Network.ETHEREUM,
      status: PurchaseStatus.PENDING,
      timestamp: 1535398843748,
      gateway: NetworkGatewayType.MOON_PAY
    }

    expect(unsetPurchase(mockPurchase)).toEqual({
      meta: undefined,
      payload: {
        purchase: mockPurchase
      },
      type: UNSET_PURCHASE
    })
  })
})
