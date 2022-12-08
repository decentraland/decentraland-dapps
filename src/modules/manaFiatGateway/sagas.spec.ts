import { select } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getAddress } from '../wallet/selectors'
import {
  manaFiatGatewayPurchaseCompleted,
  manaFiatGatewayPurchaseCompletedFailure,
  openManaFiatGateway
} from './actions'
import { MoonPay } from './moonpay'
import { MoonPayTransaction, MoonPayTransactionStatus } from './moonpay/types'
import { createManaFiatGatewaysSaga } from './sagas'
import { Transak } from './transak'
import { ManaFiatGatewaySagasConfig } from './types'
import { setPurchase } from '../mana/actions'
import { Purchase, PurchaseStatus } from '../mana/types'

jest.mock('./transak')

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

const manaFiatGatewaysSaga = createManaFiatGatewaysSaga(mockConfig)
const mockAddress = '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2'

const mockRedirectURL = encodeURIComponent(
  `${window.location.origin}?network=${Network.ETHEREUM}&gateway=${NetworkGatewayType.MOON_PAY}`
)

const mockWidgetUrl = `${mockConfig.moonPay.widgetBaseUrl}?apiKey=${mockConfig.moonPay.apiKey}&currencyCode=MANA&walletAddres=${mockAddress}&redirectURL=${mockRedirectURL}`

const mockTransaction: MoonPayTransaction = {
  id: '354b1f46-480c-4307-9896-f4c81c1e1e17',
  createdAt: '2018-08-27T19:40:43.748Z',
  updatedAt: '2018-08-27T19:40:43.804Z',
  baseCurrencyAmount: 50,
  quoteCurrencyAmount: 100,
  feeAmount: 4.99,
  extraFeeAmount: 2.5,
  networkFeeAmount: 0,
  areFeesIncluded: false,
  status: MoonPayTransactionStatus.PENDING,
  failureReason: null,
  walletAddress: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
  walletAddressTag: null,
  cryptoTransactionId: null,
  returnUrl:
    'https://buy.moonpay.com/transaction_receipt?transactionId=354b1f46-480c-4307-9896-f4c81c1e1e17',
  redirectUrl: null,
  widgetRedirectUrl: 'https://my-crypto-wallet.io',
  baseCurrencyId: '71435a8d-211c-4664-a59e-2a5361a6c5a7',
  currencyId: '8d305f63-1fd7-4e01-a220-8445e591aec4',
  customerId: '7138fb07-7c66-4f9a-a83a-a106e66bfde6',
  cardId: '68e46314-93e5-4420-ac10-485aef4e19d0',
  bankAccountId: null,
  bankDepositInformation: null,
  bankTransferReference: null,
  eurRate: 1,
  usdRate: 1.11336,
  gbpRate: 0.86044,
  externalTransactionId: '2dad9a78-bc35-452b-aa2c-968a247a9646',
  paymentMethod: 'credit_debit_card',
  baseCurrency: {
    id: '71435a8d-211c-4664-a59e-2a5361a6c5a7',
    createdAt: '2022-02-28T11:17:08.116Z',
    updatedAt: '2022-03-09T10:56:55.535Z',
    type: 'fiat',
    name: 'Euro',
    code: 'eur',
    precision: 2,
    maxAmount: 10000,
    minAmount: 20,
    minBuyAmount: 20,
    maxBuyAmount: 10000
  },
  currency: {
    id: '8d305f63-1fd7-4e01-a220-8445e591aec4',
    createdAt: '2022-02-28T11:17:08.044Z',
    updatedAt: '2022-03-09T10:57:00.494Z',
    type: 'crypto',
    name: 'Ethereum',
    code: 'eth',
    precision: 4,
    maxAmount: 3,
    minAmount: 0.03,
    minBuyAmount: 0.011,
    maxBuyAmount: 3,
    addressRegex: '^(0x)[0-9A-Fa-f]{40}$',
    testnetAddressRegex: '^(0x)[0-9A-Fa-f]{40}$',
    supportsAddressTag: false,
    addressTagRegex: null,
    supportsTestMode: true,
    supportsLiveMode: true,
    isSuspended: false,
    isSupportedInUS: true,
    notAllowedUSStates: [],
    notAllowedCountries: [],
    isSellSupported: true,
    confirmationsRequired: 12,
    minSellAmount: 0.03,
    maxSellAmount: 3
  },
  externalCustomerId: '41e794f0-b9ee-48cd-842a-431edf6555b8',
  country: 'GBR',
  stages: [
    {
      stage: 'stage_one_ordering',
      status: 'success',
      actions: [],
      failureReason: null
    },
    {
      stage: 'stage_two_verification',
      status: 'in_progress',
      actions: [
        {
          type: 'verify_card_by_code',
          url:
            'https://buy.moonpay.com/card_verification_code?cardId=68e46314-93e5-4420-ac10-485aef4e19d0'
        },
        {
          type: 'retry_kyc',
          url: 'https://buy.moonpay.com/identity_check'
        }
      ],
      failureReason: null
    },
    {
      stage: 'stage_three_processing',
      status: 'not_started',
      actions: [],
      failureReason: null
    },
    {
      stage: 'stage_four_delivery',
      status: 'not_started',
      actions: [],
      failureReason: null
    }
  ]
}

const mockPurchase: Purchase = {
  address: mockAddress,
  amount: 100,
  id: mockTransaction.id,
  network: Network.ETHEREUM,
  timestamp: 1535398843748,
  status: PurchaseStatus.PENDING,
  gateway: NetworkGatewayType.MOON_PAY
}

// () => {}
describe('when handling the request to open the MANA-FIAT gateway', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the selected gateway is Transak', () => {
    beforeEach(() => {
      jest.spyOn(Transak.prototype, 'openWidget').mockImplementation(() => {})
    })

    it('should init its SDK', () => {
      return expectSaga(manaFiatGatewaysSaga)
        .provide([[select(getAddress), mockAddress]])
        .dispatch(
          openManaFiatGateway(Network.ETHEREUM, NetworkGatewayType.TRANSAK)
        )
        .silentRun()
        .then(() => {
          expect(Transak.prototype.openWidget).toHaveBeenCalledWith(
            Network.ETHEREUM
          )
        })
    })
  })

  describe('when the selected gateway is MoonPay', () => {
    beforeEach(() => {
      window.open = jest.fn()
    })

    it('should put the action signaling the widget url', () => {
      return expectSaga(manaFiatGatewaysSaga)
        .provide([[select(getAddress), mockAddress]])
        .dispatch(
          openManaFiatGateway(Network.ETHEREUM, NetworkGatewayType.MOON_PAY)
        )
        .silentRun()
        .then(() => {
          expect(window.open).toHaveBeenCalledWith(
            mockWidgetUrl,
            '_blank',
            'noopener,noreferrer'
          )
        })
    })
  })
})

describe('when handling the completion of the purchase', () => {
  describe('when the selected gateway is MoonPay', () => {
    let moonPay: MoonPay

    beforeEach(() => {
      moonPay = new MoonPay(mockConfig.moonPay)
    })

    describe('when the selected gateway is MoonPay', () => {
      describe('when the transaction was not found', () => {
        it('should put the action signaling the failure', () => {
          const error = '404 - Transaction not found'

          return expectSaga(manaFiatGatewaysSaga)
            .provide([
              [
                matchers.call.fn(moonPay.getTransaction),
                Promise.reject(new Error(error))
              ]
            ])
            .put(
              manaFiatGatewayPurchaseCompletedFailure(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransaction.id,
                error
              )
            )
            .dispatch(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransaction.id,
                MoonPayTransactionStatus.PENDING
              )
            )
            .silentRun()
        })
      })

      describe('when the initial status is pending and it changes inmediately after starting the polling', () => {
        it('should put the action signaling that the purchase was created with its final status ', () => {
          const expectedPurchase = {
            ...mockPurchase,
            status: PurchaseStatus.COMPLETE
          }

          return expectSaga(manaFiatGatewaysSaga)
            .provide([
              [
                matchers.call.fn(moonPay.getTransaction),
                {
                  ...mockTransaction,
                  status: MoonPayTransactionStatus.COMPLETED
                }
              ]
            ])
            .put(setPurchase(expectedPurchase))
            .dispatch(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransaction.id,
                MoonPayTransactionStatus.PENDING
              )
            )
            .silentRun()
        })
      })

      describe('when the status changes after polling for some time', () => {
        it.skip('should put the action signaling that the purchase was created with its initial status and updated with the new one ', () => {
          // TODO: is this possible?
          return expectSaga(manaFiatGatewaysSaga)
            .provide([
              [matchers.call.fn(moonPay.getTransaction), mockTransaction],
              [
                matchers.call.fn(moonPay.getTransaction),
                { mockTransaction, status: MoonPayTransactionStatus.COMPLETED }
              ]
            ])
            .put(setPurchase(mockPurchase))
            .put(
              setPurchase({ ...mockPurchase, status: PurchaseStatus.COMPLETE })
            )
            .dispatch(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransaction.id,
                MoonPayTransactionStatus.PENDING
              )
            )
            .silentRun()
        })
      })
    })
  })
})
