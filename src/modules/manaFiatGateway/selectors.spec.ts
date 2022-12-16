import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
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
  isOpeningGateway
} from './selectors'

let manaFiatGatewayState: any

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
