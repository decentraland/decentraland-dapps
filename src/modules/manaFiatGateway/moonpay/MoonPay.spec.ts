import nock from 'nock'
import axios from 'axios'

import { MoonPay } from './MoonPay'
import { MoonPayConfig } from '../types'
import { MoonPayTransaction, MoonPayTransactionStatus } from './types'
import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui'

axios.defaults.adapter = require('axios/lib/adapters/http')

nock.disableNetConnect()

const mockConfig: MoonPayConfig = {
  apiKey: 'api-key',
  apiBaseUrl: 'http://base.url.xyz',
  widgetBaseUrl: 'http://widget.base.url.xyz',
  pollingDelay: 500
}

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
  cryptoTransactionId: 'crypto-transaction-id',
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

describe('when interacting with MoonPay', () => {
  let moonPay: MoonPay

  beforeEach(() => {
    moonPay = new MoonPay(mockConfig)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when build the widget url', () => {
    describe('when the location does not have pathname nor query params', () => {
      it('should return the widget url with the api key, currency code, and redirect url as query parameters', () => {
        return expect(moonPay.getWidgetUrl(Network.ETHEREUM)).toEqual(
          'http://widget.base.url.xyz?apiKey=api-key&currencyCode=MANA&redirectURL=http%3A%2F%2Flocalhost%2F%3Fnetwork%3DETHEREUM%26gateway%3DmoonPay'
        )
      })
    })

    describe('when the location have a different pathname than "/" and also query params', () => {
      beforeEach(() => {
        const location = {
          ...window.location,
          pathname: '/pathname',
          search: '?s1=1&s2=2'
        }
        jest.spyOn(window, 'location', 'get').mockReturnValue(location)
      })

      it('should return the widget url with the api key, currency code, and redirect url as query parameters', () => {
        return expect(moonPay.getWidgetUrl(Network.ETHEREUM)).toEqual(
          'http://widget.base.url.xyz?apiKey=api-key&currencyCode=MANA&redirectURL=http%3A%2F%2Flocalhost%2Fpathname%3Fs1%3D1%26s2%3D2%26network%3DETHEREUM%26gateway%3DmoonPay'
        )
      })
    })
  })

  describe('when create a purchase using the transaction id', () => {
    it('should fetch the transaction and return a purchase object', () => {
      const expectedPurchase = {
        address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
        amount: 100,
        id: '354b1f46-480c-4307-9896-f4c81c1e1e17',
        network: 'ETHEREUM',
        status: 'pending',
        timestamp: 1535398843748,
        gateway: NetworkGatewayType.MOON_PAY,
        txHash: 'crypto-transaction-id'
      }

      return expect(
        moonPay.createPurchase(mockTransaction, Network.ETHEREUM)
      ).toEqual(expectedPurchase)
    })
  })
})
