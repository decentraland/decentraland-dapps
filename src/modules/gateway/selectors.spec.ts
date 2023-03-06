import { Network } from '@dcl/schemas/dist/dapps/network'
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
  isOpeningGateway,
  getData,
  getPendingPurchases,
  getPurchases,
  getNFTPurchase,
  getPendingManaPurchase
} from './selectors'
import { TradeType } from './transak/types'
import { NFTPurchase, Purchase, PurchaseStatus } from './types'

let initialState: any

const mockManaPurchase: Purchase = {
  address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
  amount: 100,
  id: 'mock-id',
  network: Network.ETHEREUM,
  timestamp: 1535398843748,
  status: PurchaseStatus.PENDING,
  paymentMethod: 'credit_debit_card',
  gateway: NetworkGatewayType.MOON_PAY,
  txHash: null
}

const mockContractAddress = 'a-contract-address'
const mockTokenId = 'aTokenId'

const mockNFTPurchase: NFTPurchase = {
  ...mockManaPurchase,
  nft: {
    contractAddress: mockContractAddress,
    tokenId: mockTokenId,
    tradeType: TradeType.PRIMARY,
    cryptoAmount: 100
  }
}

describe('MANA-FIAT Gateway selectors', () => {
  beforeEach(() => {
    initialState = { gateway: INITIAL_STATE }
  })

  describe("when getting the gateway's state", () => {
    it('should return the state', () => {
      expect(getState(initialState)).toEqual(initialState.gateway)
    })
  })

  describe('when getting the data state of the gateway', () => {
    it("should return the gateway state's data", () => {
      expect(getData(initialState)).toEqual(initialState.gateway.data)
    })
  })

  describe('when getting the error state of the gateway', () => {
    it("should return the gateway state's errors", () => {
      expect(getError(initialState)).toEqual(initialState.gateway.error)
    })
  })

  describe('when getting the loading state of the gateway', () => {
    it("should return the gateway's state loading data", () => {
      expect(getLoading(initialState)).toEqual(initialState.gateway.loading)
    })
  })

  describe('when getting the purchases', () => {
    it("should return the array of purchases in the gateway's state", () => {
      expect(getPurchases(initialState)).toEqual(
        initialState.gateway.data.purchases
      )
    })
  })

  describe('when getting the pending purchases', () => {
    describe('when there are pending purchases', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            data: { purchases: [mockManaPurchase] },
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
        expect(getPendingPurchases(initialState)).toStrictEqual([
          mockManaPurchase
        ])
      })
    })

    describe('when there are not', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            loading: []
          }
        }
      })

      it('should return an empty array', () => {
        expect(getPendingPurchases(initialState)).toStrictEqual([])
      })
    })
  })

  describe('when getting the pending mana purchase', () => {
    describe('when there is a pending mana purchase', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            data: { purchases: [mockManaPurchase] },
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
        expect(getPendingManaPurchase(initialState)).toBe(mockManaPurchase)
      })
    })

    describe('when there is not', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            loading: []
          }
        }
      })

      it('should return undefined', () => {
        expect(getPendingManaPurchase(initialState)).toStrictEqual(undefined)
      })
    })
  })

  describe('when getting the nft purchase', () => {
    describe('when there is a nft purchase with tokenId', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            data: { purchases: [mockNFTPurchase] },
            loading: []
          }
        }
      })

      it('should return it', () => {
        expect(
          getNFTPurchase(initialState, mockContractAddress, mockTokenId)
        ).toBe(mockNFTPurchase)
      })
    })

    describe('when there is a nft purchase with itemId', () => {
      const mockNftPurchaseWithItemId = {
        ...mockNFTPurchase,
        nft: {
          ...mockNFTPurchase.nft,
          itemId: mockNFTPurchase.nft.tokenId,
          tokenId: undefined
        }
      }

      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            data: {
              purchases: [mockNftPurchaseWithItemId]
            },
            loading: []
          }
        }
      })

      it('should return it', () => {
        expect(
          getNFTPurchase(initialState, mockContractAddress, mockTokenId)
        ).toBe(mockNftPurchaseWithItemId)
      })
    })

    describe('when there is more than one nft purchase for the same contract address and token id', () => {
      let mockLastNFTPurchase: Purchase

      beforeEach(() => {
        mockLastNFTPurchase = {
          ...mockNFTPurchase,
          timestamp: mockNFTPurchase.timestamp + 10
        }

        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            data: {
              purchases: [mockNFTPurchase, mockLastNFTPurchase]
            },
            loading: []
          }
        }
      })

      it('should return it', () => {
        expect(
          getNFTPurchase(initialState, mockContractAddress, mockTokenId)
        ).toBe(mockLastNFTPurchase)
      })
    })

    describe('when there is not', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            loading: []
          }
        }
      })

      it('should return undefined', () => {
        expect(
          getNFTPurchase(initialState, mockContractAddress, mockTokenId)
        ).toBeUndefined()
      })
    })
  })

  describe('when getting if the set gateway purchase completed is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
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
        expect(isFinishingPurchase(initialState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isFinishingPurchase(initialState)).toBe(false)
      })
    })
  })

  describe('when getting if the open gateway request is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
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
        expect(isOpeningGateway(initialState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          gateway: {
            ...initialState.gateway,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isOpeningGateway(initialState)).toBe(false)
      })
    })
  })
})
