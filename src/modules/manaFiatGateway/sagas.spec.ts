import { load } from 'redux-persistence'
import { call, select } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { ChainId, Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getChainIdByNetwork } from '../../lib/eth'
import { getAddress } from '../wallet/selectors'
import { setPurchase, unsetPurchase } from '../mana/actions'
import { Purchase, PurchaseStatus } from '../mana/types'
import { openModal } from '../modal/actions'
import { fetchWalletRequest } from '../wallet/actions'
import {
  addManaPurchaseAsTransaction,
  manaFiatGatewayPurchaseCompleted,
  manaFiatGatewayPurchaseCompletedFailure,
  openBuyManaWithFiatModalFailure,
  openBuyManaWithFiatModalRequest,
  openBuyManaWithFiatModalSuccess,
  openManaFiatGatewayFailure,
  openManaFiatGatewayRequest,
  openManaFiatGatewaySuccess
} from './actions'
import { MoonPay } from './moonpay'
import { MoonPayTransaction, MoonPayTransactionStatus } from './moonpay/types'
import { createManaFiatGatewaysSaga } from './sagas'
import { Transak } from './transak'
import { ManaFiatGatewaySagasConfig } from './types'
import { getPendingPurchase } from './selectors'

jest.mock('../../lib/eth')
jest.mock('./transak')

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

const manaFiatGatewaysSaga = createManaFiatGatewaysSaga(mockConfig)
const mockAddress = '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2'

const mockWidgetUrl =
  'http://widget.base.url.xyz?apiKey=api-key&currencyCode=MANA&redirectURL=http%3A%2F%2Flocalhost%2F%3Fnetwork%3DETHEREUM%26gateway%3DmoonPay'

const mockCryptoTransactionId = 'crypto-transaction-id'
const mockTxUrl = `https://goerli.etherscan.io/tx/${mockCryptoTransactionId}`

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
  cryptoTransactionId: mockCryptoTransactionId,
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
  gateway: NetworkGatewayType.MOON_PAY,
  txHash: null
}

const mockPurchaseWithCryptoTransactionId = {
  ...mockPurchase,
  txHash: mockCryptoTransactionId
}

const buyManaWithFiatModalName = 'BuyManaWithFiatModal'
const buyManaWithFiatFeedbackModalName = 'BuyManaWithFiatFeedbackModal'

describe('when handling the request to open the Buy MANA with FIAT modal', () => {
  const error = 'Default Error'

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the pending purchase selector fails', () => {
    it('should put the failure action', async () => {
      return expectSaga(manaFiatGatewaysSaga)
        .provide([
          [select(getPendingPurchase), Promise.reject(new Error(error))]
        ])
        .dispatch(openBuyManaWithFiatModalRequest())
        .put(openBuyManaWithFiatModalFailure(error))
        .silentRun()
    })
  })

  describe('when there is no pending purchase', () => {
    let selectedNetwork: Network | undefined

    describe('when there is no selected network', () => {
      it('should put the action signaling the opening of the Buy MANA with FIAT modal and that the request succeed', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .provide([[select(getPendingPurchase), undefined]])
          .dispatch(openBuyManaWithFiatModalRequest())
          .put(
            openModal(buyManaWithFiatModalName, { selectedNetwork: undefined })
          )
          .put(openBuyManaWithFiatModalSuccess())
          .silentRun()
      })
    })

    describe('when there is a selected network', () => {
      beforeEach(() => {
        selectedNetwork = Network.ETHEREUM
      })

      it('should put the action signaling the opening of the Buy MANA with FIAT modal and that the request succeed', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .provide([[select(getPendingPurchase), undefined]])
          .dispatch(openBuyManaWithFiatModalRequest(selectedNetwork))
          .put(openModal(buyManaWithFiatModalName, { selectedNetwork }))
          .put(openBuyManaWithFiatModalSuccess())
          .silentRun()
      })
    })
  })

  describe('when there is a pending purchase', () => {
    describe('when the selected gateway was Transak', () => {
      it('should put the action signaling the opening of the Feedback Modal in pending status without a go to url, and that the request succeed', async () => {
        const transakMockPurchase = {
          ...mockPurchase,
          gateway: NetworkGatewayType.TRANSAK
        }

        return expectSaga(manaFiatGatewaysSaga)
          .provide([[select(getPendingPurchase), transakMockPurchase]])
          .dispatch(openBuyManaWithFiatModalRequest())
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: transakMockPurchase,
              goToUrl: undefined
            })
          )
          .put(openBuyManaWithFiatModalSuccess())
          .silentRun()
      })
    })
  })

  describe('when the selected gateway was Moon Pay', () => {
    describe('when failing on trying to get the transaction receipt url', () => {
      beforeEach(() => {
        jest
          .spyOn(MoonPay.prototype, 'getTransactionReceiptUrl')
          .mockImplementation(() => {
            throw new Error(error)
          })
      })

      it('should put the failure action', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .provide([
            [select(getPendingPurchase), mockPurchaseWithCryptoTransactionId]
          ])
          .dispatch(openBuyManaWithFiatModalRequest())
          .put(openBuyManaWithFiatModalFailure(error))
          .silentRun()
      })
    })

    describe('when suceeding on getting the receipt url', () => {
      const mockTxReceiptUrl = `${mockConfig.moonPay.widgetBaseUrl}/transaction_receipt?transactionId=${mockPurchase.id}`
      beforeEach(() => {
        jest
          .spyOn(MoonPay.prototype, 'getTransactionReceiptUrl')
          .mockReturnValue(mockTxReceiptUrl)
      })

      it('should put the action signaling the opening of the Feedback Modal in pending status with the go to url, and that the request succeed', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .provide([
            [select(getPendingPurchase), mockPurchaseWithCryptoTransactionId]
          ])
          .dispatch(openBuyManaWithFiatModalRequest())
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: mockPurchaseWithCryptoTransactionId,
              goToUrl: mockTxReceiptUrl
            })
          )
          .silentRun()
      })
    })
  })
})

describe('when handling the request to open the MANA-FIAT gateway', () => {
  const error = 'Default Error'

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the selected gateway is Transak', () => {
    describe('when the call to open widget fails', () => {
      beforeEach(() => {
        jest.spyOn(Transak.prototype, 'openWidget').mockImplementation(() => {
          throw new Error(error)
        })
      })

      it('should put the failure action', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .provide([[select(getAddress), mockAddress]])
          .dispatch(
            openManaFiatGatewayRequest(
              Network.ETHEREUM,
              NetworkGatewayType.TRANSAK
            )
          )
          .put(
            openManaFiatGatewayFailure(
              Network.ETHEREUM,
              NetworkGatewayType.TRANSAK,
              error
            )
          )
          .silentRun()
      })
    })

    it('should init its SDK and put the success action', () => {
      jest.spyOn(Transak.prototype, 'openWidget').mockImplementation(() => {})

      return expectSaga(manaFiatGatewaysSaga)
        .provide([[select(getAddress), mockAddress]])
        .dispatch(
          openManaFiatGatewayRequest(
            Network.ETHEREUM,
            NetworkGatewayType.TRANSAK
          )
        )
        .put(openManaFiatGatewaySuccess())
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

    describe('when the call to get widget url fails', () => {
      beforeEach(() => {
        jest.spyOn(MoonPay.prototype, 'getWidgetUrl').mockImplementation(() => {
          throw new Error(error)
        })
      })

      it('should put the failure action', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .dispatch(
            openManaFiatGatewayRequest(
              Network.ETHEREUM,
              NetworkGatewayType.MOON_PAY
            )
          )
          .put(
            openManaFiatGatewayFailure(
              Network.ETHEREUM,
              NetworkGatewayType.MOON_PAY,
              error
            )
          )
          .silentRun()
      })
    })

    it('should open a new tab with the widget url and put the success action', () => {
      jest
        .spyOn(MoonPay.prototype, 'getWidgetUrl')
        .mockReturnValueOnce(mockWidgetUrl)

      return expectSaga(manaFiatGatewaysSaga)
        .dispatch(
          openManaFiatGatewayRequest(
            Network.ETHEREUM,
            NetworkGatewayType.MOON_PAY
          )
        )
        .put(openManaFiatGatewaySuccess())
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
  beforeEach(() => {
    mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_GOERLI)
  })

  describe('when the selected gateway is MoonPay', () => {
    let moonPay: MoonPay

    beforeEach(() => {
      moonPay = new MoonPay(mockConfig.moonPay)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

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
          ...mockPurchaseWithCryptoTransactionId,
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
            ],
            [
              call(getChainIdByNetwork, Network.ETHEREUM),
              ChainId.ETHEREUM_GOERLI
            ]
          ])

          .put(setPurchase(expectedPurchase))
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: expectedPurchase,
              transactionUrl: mockTxUrl
            })
          )
          .put(fetchWalletRequest())
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
      beforeEach(() => {
        jest
          .spyOn(MoonPay.prototype, 'getTransaction')
          .mockImplementationOnce(() => Promise.resolve(mockTransaction))
          .mockImplementationOnce(() =>
            Promise.resolve({
              ...mockTransaction,
              status: MoonPayTransactionStatus.COMPLETED
            })
          )
      })

      it('should put the action signaling that the purchase was created with its initial status and updated with the new one ', () => {
        const expectedPurchase = {
          ...mockPurchaseWithCryptoTransactionId,
          status: PurchaseStatus.COMPLETE
        }

        return expectSaga(manaFiatGatewaysSaga)
          .provide([
            [
              call(getChainIdByNetwork, Network.ETHEREUM),
              ChainId.ETHEREUM_GOERLI
            ]
          ])
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: mockPurchaseWithCryptoTransactionId,
              goToUrl:
                'http://widget.base.url.xyz/transaction_receipt?transactionId=354b1f46-480c-4307-9896-f4c81c1e1e17'
            })
          )
          .put(setPurchase(mockPurchaseWithCryptoTransactionId))
          .put(setPurchase(expectedPurchase))
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: expectedPurchase,
              transactionUrl: mockTxUrl
            })
          )
          .put(fetchWalletRequest())
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

describe('when handling the action signaling the set purchase', () => {
  beforeEach(() => {
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the purchase is not yet complete, failed, nor cancelled', () => {
    describe('when the purchase is from Transak', () => {
      it('should not put the fetch wallet request action but should add a listener to the beforeunload event', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .dispatch(
            setPurchase({
              ...mockPurchase,
              gateway: NetworkGatewayType.TRANSAK
            })
          )
          .silentRun()
          .then(({ effects }) => {
            expect(effects.put).toBeUndefined()
            expect(window.addEventListener).toHaveBeenCalledTimes(1)
            expect(window.removeEventListener).not.toHaveBeenCalled()
          })
      })
    })

    describe('when the purchase is from MoonPay', () => {
      it('should not put the fetch wallet request action nor add the listener to the beforeunload event', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .dispatch(setPurchase(mockPurchase))
          .silentRun()
          .then(({ effects }) => {
            expect(effects.put).toBeUndefined()
            expect(window.addEventListener).not.toHaveBeenCalled()
            expect(window.removeEventListener).toHaveBeenCalledTimes(1)
          })
      })
    })
  })

  describe('when the purchase is complete', () => {
    describe('and the tx hash is not in the purchase', () => {
      it('should put the fetch wallet request and the open modal action with the correct status (without the transaction url) without adding the purchase as a transaction', async () => {
        const expectedPurchase = {
          ...mockPurchaseWithCryptoTransactionId,
          txHash: null,
          status: PurchaseStatus.COMPLETE
        }

        return expectSaga(manaFiatGatewaysSaga)
          .dispatch(setPurchase(expectedPurchase))
          .put(fetchWalletRequest())
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: expectedPurchase,
              transactionUrl: undefined
            })
          )
          .silentRun()
          .then(({ effects }) => {
            expect(effects.put).toBeUndefined()
            expect(window.addEventListener).not.toHaveBeenCalled()
            expect(window.removeEventListener).toHaveBeenCalledTimes(1)
          })
      })
    })

    describe('and the tx hash is present in the purchase', () => {
      it('should put the fetch wallet request, the add MANA purchase as transaction, and the open modal action with the correct status and transaction url using the chainId', async () => {
        const expectedPurchase = {
          ...mockPurchaseWithCryptoTransactionId,
          status: PurchaseStatus.COMPLETE
        }

        return expectSaga(manaFiatGatewaysSaga)
          .provide([
            [
              call(getChainIdByNetwork, Network.ETHEREUM),
              ChainId.ETHEREUM_GOERLI
            ]
          ])
          .dispatch(setPurchase(expectedPurchase))
          .put(fetchWalletRequest())
          .put(addManaPurchaseAsTransaction(expectedPurchase))
          .put(
            openModal(buyManaWithFiatFeedbackModalName, {
              purchase: expectedPurchase,
              transactionUrl: mockTxUrl
            })
          )
          .silentRun()
          .then(() => {
            expect(window.addEventListener).not.toHaveBeenCalled()
            expect(window.removeEventListener).toHaveBeenCalledTimes(1)
          })
      })
    })
  })

  describe('when the purchase is failed', () => {
    it('should put the fetch wallet request action and the open modal action with the correct status', async () => {
      const expectedPurchase = {
        ...mockPurchaseWithCryptoTransactionId,
        status: PurchaseStatus.FAILED
      }

      return expectSaga(manaFiatGatewaysSaga)
        .dispatch(setPurchase(expectedPurchase))
        .put(addManaPurchaseAsTransaction(expectedPurchase))
        .put(
          openModal(buyManaWithFiatFeedbackModalName, {
            purchase: expectedPurchase,
            transactionUrl: undefined
          })
        )
        .silentRun()
        .then(() => {
          expect(window.addEventListener).not.toHaveBeenCalled()
          expect(window.removeEventListener).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('when the purchase is cancelled', () => {
    it('should put the fetch wallet request action and the open modal action with the correct status', async () => {
      const expectedPurchase = {
        ...mockPurchaseWithCryptoTransactionId,
        status: PurchaseStatus.CANCELLED
      }

      return expectSaga(manaFiatGatewaysSaga)
        .dispatch(setPurchase(expectedPurchase))
        .put(addManaPurchaseAsTransaction(expectedPurchase))
        .put(
          openModal(buyManaWithFiatFeedbackModalName, {
            purchase: expectedPurchase,
            transactionUrl: undefined
          })
        )
        .silentRun()
        .then(() => {
          expect(window.addEventListener).not.toHaveBeenCalled()
          expect(window.removeEventListener).toHaveBeenCalledTimes(1)
        })
    })
  })
})

describe('when handling the action signaling the load of the local storage into the state', () => {
  describe('when there is no pending purchases in the state', () => {
    it('should not put any action', async () => {
      return expectSaga(manaFiatGatewaysSaga)
        .provide([[select(getPendingPurchase), undefined]])
        .dispatch(load({}))
        .silentRun()
        .then(({ effects }) => {
          expect(effects.put).toBeUndefined()
        })
    })
  })

  describe('when there is a pending purchase in the state', () => {
    describe('when it is a MoonPay purchase', () => {
      it('should put the action signaling the completion of the purchase', async () => {
        return expectSaga(manaFiatGatewaysSaga)
          .provide([
            [select(getPendingPurchase), mockPurchaseWithCryptoTransactionId]
          ])
          .dispatch(load({}))
          .put(
            manaFiatGatewayPurchaseCompleted(
              Network.ETHEREUM,
              NetworkGatewayType.MOON_PAY,
              mockPurchaseWithCryptoTransactionId.id,
              MoonPayTransactionStatus.PENDING
            )
          )
          .silentRun()
      })
    })

    describe('when it is a Transak purchase', () => {
      it('should remove it from the list of purchases because it cannot be tracked anymore', async () => {
        const transakPurchase = {
          ...mockPurchase,
          gateway: NetworkGatewayType.TRANSAK
        }

        return expectSaga(manaFiatGatewaysSaga)
          .provide([[select(getPendingPurchase), transakPurchase]])
          .dispatch(load({}))
          .put(unsetPurchase(transakPurchase))
          .silentRun()
      })
    })
  })
})
