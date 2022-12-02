import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { manaFiatGatewayPurchaseCompleted, setWidgetUrl } from './actions'
import { MoonPayTransactionStatus } from './moonpay/types'
import { INITIAL_STATE } from './reducer'
import {
  getData,
  getState,
  getError,
  getLoading,
  isRenderingWidget,
  isFinishingPurchase,
  getWidgetUrl
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

  describe("when getting the manaFiatGateway state's data", () => {
    beforeEach(() => {
      manaFiatGatewayState = {
        ...manaFiatGatewayState,
        manaFiatGateway: {
          ...manaFiatGatewayState.manaFiatGateway,
          data: { widgetUrl: 'anUrl' }
        }
      }
    })

    it("should return the manaFiatGateway's state data", () => {
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

  describe('when getting if the set manaFiatGateway widget url is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        manaFiatGatewayState = {
          ...manaFiatGatewayState,
          manaFiatGateway: {
            ...manaFiatGatewayState.manaFiatGateway,
            loading: [setWidgetUrl('anUrl')]
          }
        }
      })

      it('should return true', () => {
        expect(isRenderingWidget(manaFiatGatewayState)).toBe(true)
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
        expect(isRenderingWidget(manaFiatGatewayState)).toBe(false)
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

  describe('when getting the manaFiatGateway widget url', () => {
    beforeEach(() => {
      manaFiatGatewayState = {
        ...manaFiatGatewayState,
        manaFiatGateway: {
          ...manaFiatGatewayState.manaFiatGateway,
          data: { widgetUrl: 'anUrl' }
        }
      }
    })

    it("should return the manaFiatGateway state's widget url", () => {
      expect(getWidgetUrl(manaFiatGatewayState)).toEqual('anUrl')
    })
  })
})
