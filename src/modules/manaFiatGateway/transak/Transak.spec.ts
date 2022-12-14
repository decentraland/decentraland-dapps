import transakSDK from '@transak/transak-sdk'
import { NetworkGatewayType } from 'decentraland-ui'
import { Transak } from '../transak/Transak'
import { ManaFiatGatewaySagasConfig } from '../types'
import { Network } from '@dcl/schemas'
import { OrderData } from './types'
import { Purchase, PurchaseStatus } from '../../mana/types'
import { createManaFiatGatewaysSaga } from '../sagas'
import { expectSaga } from 'redux-saga-test-plan'
import { setPurchase } from '../../mana/actions'
import { fetchWalletRequest } from '../../wallet/actions'

const mockConfig: ManaFiatGatewaySagasConfig = {
  [NetworkGatewayType.MOON_PAY]: {
    apiKey: 'api-key',
    apiBaseUrl: 'http://base.url.xyz',
    widgetBaseUrl: 'http://widget.base.url.xyz',
    pollingDelay: 50
  },
  [NetworkGatewayType.TRANSAK]: {
    key: 'transak-key',
    env: 'TEST'
  }
}

const mockAddress = '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2'
const mockOrderData: OrderData = {
  eventName: 'event name',
  status: {
    id: 'order-id',
    autoExpiresAt: '2022-12-14T14:32:35.396Z',
    conversionPrice: 10,
    convertedFiatAmount: 10,
    convertedFiatCurrency: 'MANA',
    createdAt: '2022-12-14T14:32:35.396Z',
    cryptoAmount: 10,
    cryptoCurrency: 'MANA',
    cryptocurrency: 'MANA',
    envName: 'env',
    fiatAmount: 10,
    fiatCurrency: 'USD',
    fromWalletAddress: mockAddress,
    isBuyOrSell: 'BUY',
    network: 'ethereum',
    paymentOptionId: 'payment-option-id',
    quoteId: 'quote-id',
    referenceCode: 12345,
    reservationId: 'reservation-id',
    status: 'pending',
    totalFeeInFiat: 2,
    walletAddress: mockAddress,
    walletLink: 'wallet-link'
  }
}

const mockPurchase: Purchase = {
  address: mockAddress,
  amount: 10,
  id: mockOrderData.status.id,
  network: Network.ETHEREUM,
  timestamp: 1671028355396,
  status: PurchaseStatus.PENDING,
  gateway: NetworkGatewayType.TRANSAK
}

const manaFiatGatewaysSaga = createManaFiatGatewaysSaga(mockConfig)

describe('when interacting with Transak', () => {
  let transak: Transak

  beforeEach(() => {
    transak = new Transak(mockConfig.transak, mockAddress, Network.ETHEREUM)
  })

  describe('when emitting a purchase event in the purchaseEventsChannel', () => {
    describe('when the status of the purchase is not yet complete', () => {
      it('should put a new message in the channel signaling the set of the purchase without trying to refresh the balance', () => {
        transak.emitPurchaseEvent(
          mockOrderData,
          PurchaseStatus.PENDING,
          Network.ETHEREUM
        )
        return expectSaga(manaFiatGatewaysSaga)
          .put(setPurchase(mockPurchase))
          .silentRun()
      })
    })

    describe('when the status of the purchase is complete', () => {
      it('should put a new message in the channel signaling the set of the purchase and the request to refresh the balance', () => {
        transak.emitPurchaseEvent(
          mockOrderData,
          PurchaseStatus.COMPLETE,
          Network.ETHEREUM
        )
        return expectSaga(manaFiatGatewaysSaga)
          .put(
            setPurchase({ ...mockPurchase, status: PurchaseStatus.COMPLETE })
          )
          .put(fetchWalletRequest())
          .silentRun()
      })
    })
  })

  describe('when opnening the widget', () => {
    beforeEach(() => {
      jest.spyOn(transakSDK.prototype, 'init').mockImplementation(() => {})
    })

    it('should call the method init from the Transak SDK', () => {
      transak.openWidget(Network.ETHEREUM)
      return expect(transakSDK.prototype.init).toHaveBeenCalled()
    })
  })
})
