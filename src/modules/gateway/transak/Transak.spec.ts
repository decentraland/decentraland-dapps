import { select } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import transakSDK from '@transak/transak-sdk'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui'
import { getChainIdByNetwork } from '../../../lib/eth'
import { setPurchase } from '../../gateway/actions'
import { fetchWalletRequest } from '../../wallet/actions'
import { getChainId } from '../../wallet/selectors'
import { Transak } from '../transak/Transak'
import { createGatewaySaga } from '../sagas'
import { ManaFiatGatewaySagasConfig, Purchase, PurchaseStatus } from '../types'
import { OrderData, TransakOrderStatus } from './types'

jest.mock('../../../lib/eth')

const mockGetChainIdByNetwork = getChainIdByNetwork as jest.MockedFunction<
  typeof getChainIdByNetwork
>

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
    isNFTOrder: false,
    network: 'ethereum',
    paymentOptionId: 'payment-option-id',
    quoteId: 'quote-id',
    referenceCode: 12345,
    reservationId: 'reservation-id',
    status: TransakOrderStatus.PROCESSING,
    totalFeeInFiat: 2,
    transactionHash: 'mock-transaction-hash',
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
  gateway: NetworkGatewayType.TRANSAK,
  txHash: 'mock-transaction-hash'
}

const gatewaysSaga = createGatewaySaga(mockConfig)

describe('when interacting with Transak', () => {
  let transak: Transak

  beforeEach(() => {
    transak = new Transak(mockConfig.transak)
    mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_GOERLI)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when emitting a purchase event in the purchaseEventsChannel', () => {
    describe('when the status of the purchase is not yet complete', () => {
      it('should put a new message in the channel signaling the set of the purchase without trying to refresh the balance', () => {
        transak.emitPurchaseEvent(mockOrderData, Network.ETHEREUM)
        return expectSaga(gatewaysSaga)
          .provide([[select(getChainId), ChainId.ETHEREUM_GOERLI]])
          .put(setPurchase(mockPurchase))
          .silentRun()
      })
    })

    describe('when the status of the purchase is complete', () => {
      it('should put a new message in the channel signaling the set of the purchase and the request to refresh the balance', () => {
        transak.emitPurchaseEvent(
          {
            ...mockOrderData,
            status: {
              ...mockOrderData.status,
              status: TransakOrderStatus.COMPLETED
            }
          },
          Network.ETHEREUM
        )
        return expectSaga(gatewaysSaga)
          .provide([[select(getChainId), ChainId.ETHEREUM_GOERLI]])
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
      jest.spyOn(transakSDK.prototype, 'init').mockImplementation(() => { })
    })

    it('should call the method init from the Transak SDK', () => {
      transak.openWidget(mockAddress, Network.ETHEREUM)
      return expect(transakSDK.prototype.init).toHaveBeenCalled()
    })
  })
})
