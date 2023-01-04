import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { Purchase, PurchaseStatus } from '../mana/types'
import {
  manaFiatGatewayPurchaseCompleted,
  openManaFiatGatewayRequest
} from './actions'
import { MoonPayTransactionStatus } from './moonpay/types'
import { INITIAL_STATE } from './reducer'
import {
  getState,
  getError,
  getLoading,
  isFinishingPurchase,
  isOpeningGateway,
  getData,
  getPendingPurchase,
  getPurchases
} from './selectors'

let manaFiatGatewayState: any

const mockPurchase: Purchase = {
  address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
  amount: 100,
  id: 'mock-id',
  network: Network.ETHEREUM,
  timestamp: 1535398843748,
  status: PurchaseStatus.PENDING,
  gateway: NetworkGatewayType.MOON_PAY,
  txHash: null
}

describe('MANA-FIAT Gateway selectors', () => {
  beforeEach(() => {
    manaFiatGatewayState = { manaFiatGateway: INITIAL_STATE }
  })

  describe("when getting the manaFiatGateway's state", () => {
    it('should return the state', () => {
      expect(getState(manaFiatGatewayState)).toEqual(
        manaFiatGatewayState.manaFiatGateway
      )
    })
  })

  describe('when getting the data state of the manaFiatGateway', () => {
    it("should return the manaFiatGateway state's data", () => {
      expect(getData(manaFiatGatewayState)).toEqual(
        manaFiatGatewayState.manaFiatGateway.data
      )
    })
  })

  describe('when getting the error state of the manaFiatGateway', () => {
    it("should return the manaFiatGateway state's errors", () => {
      expect(getError(manaFiatGatewayState)).toEqual(
        manaFiatGatewayState.manaFiatGateway.error
      )
    })
  })

  describe('when getting the loading state of the manaFiatGateway', () => {
    it("should return the manaFiatGateway's state loading data", () => {
      expect(getLoading(manaFiatGatewayState)).toEqual(
        manaFiatGatewayState.manaFiatGateway.loading
      )
    })
  })

  describe('when getting the purchases', () => {
    it("should return the array of purchases in the manaFiatGateway's state", () => {
      expect(getPurchases(manaFiatGatewayState)).toEqual(
        manaFiatGatewayState.manaFiatGateway.data.purchases
      )
    })
  })

  describe('when getting the pending purchase', () => {
    describe('when there is a pending purchase', () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            data: { purchases: [mockPurchase] },
            loading: [
              openManaFiatGatewayRequest(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY
              )
            ]
          }
        }
      })

      it('should return it', () => {
        expect(getPendingPurchase(manaFiatGatewayState)).toBe(mockPurchase)
      })
    })

    describe('when there is not', () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            loading: []
          }
        }
      })

      it('should return undefined', () => {
        expect(getPendingPurchase(manaFiatGatewayState)).toBeUndefined()
      })
    })
  })

  describe('when getting if the set manaFiatGateway purchase completed is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            loading: [
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                'aTransactionId',
                MoonPayTransactionStatus.PENDING
              )
            ]
          }
        }
      })

      it('should return true', () => {
        expect(isFinishingPurchase(manaFiatGatewayState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isFinishingPurchase(manaFiatGatewayState)).toBe(false)
      })
    })
  })

  describe('when getting if the open manaFiatGateway request is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            loading: [
              openManaFiatGatewayRequest(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY
              )
            ]
          }
        }
      })

      it('should return true', () => {
        expect(isOpeningGateway(manaFiatGatewayState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isOpeningGateway(manaFiatGatewayState)).toBe(false)
      })
    })
  })
})
